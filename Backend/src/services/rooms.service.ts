import { query } from '../config/database.js';
import { Room, CreateRoomRequest, UpdateRoomRequest, RoomSchedule } from '../models/types.js';

export class RoomsService {
  async getAllRooms(): Promise<Room[]> {
    const result = await query<Room>(
      'SELECT * FROM salle WHERE is_exists = TRUE ORDER BY name_room'
    );
    return result.rows;
  }

  async getRoomById(id: string): Promise<Room | null> {
    const result = await query<Room>(
      'SELECT * FROM salle WHERE id_room = $1 AND is_exists = TRUE',
      [id]
    );
    return result.rows[0] || null;
  }

  async createRoom(data: CreateRoomRequest): Promise<Room> {
    const result = await query<Room>(
      `INSERT INTO salle (name_room, ip_arduino, volume_room, glazed_surface, nb_doors,
        nb_exterior_walls, co2_threshold, min_temp, max_temp, min_hum, max_hum)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.name_room,
        data.ip_arduino || null,
        data.volume_room || null,
        data.glazed_surface || null,
        data.nb_doors || null,
        data.nb_exterior_walls || null,
        data.co2_threshold || null,
        data.min_temp || null,
        data.max_temp || null,
        data.min_hum || null,
        data.max_hum || null
      ]
    );
    return result.rows[0];
  }

  async updateRoom(data: UpdateRoomRequest): Promise<Room | null> {
    const { id_room, ...updateData } = data;

    // Build dynamic update query
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getRoomById(id_room);
    }

    values.push(id_room);

    const result = await query<Room>(
      `UPDATE salle SET ${fields.join(', ')} WHERE id_room = $${paramIndex} AND is_exists = TRUE RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const room = result.rows[0];

    // Sync config to Arduino if temperature or IP changed
    const tempChanged = updateData.min_temp !== undefined || updateData.max_temp !== undefined;
    const ipChanged = updateData.ip_arduino !== undefined;

    if ((tempChanged || ipChanged) && room.ip_arduino) {
      await this.syncTempConfigToArduino(room);
    }

    return room;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE salle SET is_exists = FALSE WHERE id_room = $1 AND is_exists = TRUE',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getRoomSchedules(roomId: string): Promise<RoomSchedule[]> {
    const result = await query<RoomSchedule>(
      'SELECT * FROM horaire_salle WHERE id_room = $1 ORDER BY day_of_week',
      [roomId]
    );
    return result.rows;
  }

  async updateRoomSchedule(roomId: string, schedules: Partial<RoomSchedule>[]): Promise<void> {
    for (const schedule of schedules) {
      await query(
        `INSERT INTO horaire_salle (day_of_week, start_time, end_time, id_room)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (day_of_week, id_room)
         DO UPDATE SET start_time = $2, end_time = $3`,
        [schedule.day_of_week, schedule.start_time, schedule.end_time, roomId]
      );
    }
  }

  /**
   * Sync temperature config to Arduino
   */
  async syncTempConfigToArduino(room: Room): Promise<{ success: boolean; error?: string }> {
    if (!room.ip_arduino) {
      return { success: false, error: 'No Arduino IP configured' };
    }

    if (room.min_temp === null || room.max_temp === null) {
      return { success: false, error: 'Temperature values not set' };
    }

    try {
      const tempConfig = {
        mintemp: room.min_temp,
        maxtemp: room.max_temp
      };
      await this.sendToArduino(room.ip_arduino, '/temp', tempConfig);
      console.log(`Temp config synced to Arduino at ${room.ip_arduino}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to sync temp config to Arduino:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sync hours config to Arduino
   */
  async syncHoursConfigToArduino(room: Room): Promise<{ success: boolean; error?: string }> {
    if (!room.ip_arduino) {
      return { success: false, error: 'No Arduino IP configured' };
    }

    try {
      const schedules = await this.getRoomSchedules(room.id_room);
      if (schedules.length === 0) {
        return { success: false, error: 'No schedules configured' };
      }

      // Format for Arduino: { monday: { start: "08:00", end: "18:00" }, ... }
      const hoursPayload: Record<string, { start: string; end: string }> = {};
      for (const schedule of schedules) {
        const dayKey = schedule.day_of_week.toLowerCase();
        hoursPayload[dayKey] = {
          start: schedule.start_time || '00:00',
          end: schedule.end_time || '00:00'
        };
      }

      await this.sendToArduino(room.ip_arduino, '/hours', hoursPayload);
      console.log(`Hours config synced to Arduino at ${room.ip_arduino}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to sync hours config to Arduino:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private async sendToArduino(ipArduino: string, endpoint: string, data: unknown): Promise<void> {
    const url = `http://${ipArduino}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`Arduino responded with status ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to send to Arduino at ${url}:`, error);
      throw error;
    }
  }
}
