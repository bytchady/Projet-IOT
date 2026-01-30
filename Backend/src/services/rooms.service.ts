import { query } from '../config/database.js';
import {
  CreateRoomRequest, DaySchedule, Rooms, RoomWithSchedule,
  UpdateRoomRequest, WeekDay, WeeklySchedule
} from '../models/types.js';

export class RoomsService {

  private Days: WeekDay[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  async getAllRooms(): Promise<RoomWithSchedule[]> {
    const result = await query('SELECT * FROM rooms WHERE is_exists = TRUE ORDER BY name_room');
    return result.rows.map(row => this.mapDbRowToRoom(row));
  }

  async getRoomById(id: string): Promise<RoomWithSchedule | null> {
    const result = await query('SELECT * FROM rooms WHERE id_room = $1 AND is_exists = TRUE', [id]);
    if (!result.rows.length) return null;
    return this.mapDbRowToRoom(result.rows[0]);
  }

  private normalizeSchedule(schedule?: Partial<WeeklySchedule>): WeeklySchedule {
    const base: WeeklySchedule = {
      monday: { start: '00:00', end: '00:00' },
      tuesday: { start: '00:00', end: '00:00' },
      wednesday: { start: '00:00', end: '00:00' },
      thursday: { start: '00:00', end: '00:00' },
      friday: { start: '00:00', end: '00:00' },
      saturday: { start: '00:00', end: '00:00' },
      sunday: { start: '00:00', end: '00:00' },
    };
    return { ...base, ...schedule };
  }

  private mapDbRowToRoom(row: any): RoomWithSchedule {
    return {
      idRoom: row.id_room,
      nameRoom: row.name_room,
      ipArduino: row.ip_arduino,
      volumeRoom: row.volume_room,
      glazedSurface: row.glazed_surface,
      nbDoors: row.nb_doors,
      nbExteriorWalls: row.nb_exterior_walls,
      minTemp: row.min_temp,
      maxTemp: row.max_temp,
      isExists: row.is_exists,
      schedule: this.Days.reduce((acc, day) => {
        acc[day] = {
          start: row[`${day}_start`] ?? '00:00',
          end: row[`${day}_end`] ?? '00:00'
        };
        return acc;
      }, {} as WeeklySchedule)
    };
  }

  async createRoom(data: CreateRoomRequest): Promise<RoomWithSchedule> {
    const schedule = this.normalizeSchedule(data.schedule);
    const result = await query(
      `INSERT INTO rooms (
        name_room, ip_arduino, volume_room, glazed_surface,
        nb_doors, nb_exterior_walls, min_temp, max_temp,
        monday_start, monday_end,
        tuesday_start, tuesday_end,
        wednesday_start, wednesday_end,
        thursday_start, thursday_end,
        friday_start, friday_end,
        saturday_start, saturday_end,
        sunday_start, sunday_end,
        is_exists
      ) VALUES (
                 $1,$2,$3,$4,$5,$6,$7,$8,
                 $9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,
                 TRUE
               ) RETURNING *`,
      [
        data.nameRoom, data.ipArduino ?? null, data.volumeRoom ?? null, data.glazedSurface ?? null,
        data.nbDoors ?? null, data.nbExteriorWalls ?? null, data.minTemp ?? null, data.maxTemp ?? null,
        schedule.monday.start, schedule.monday.end,
        schedule.tuesday.start, schedule.tuesday.end,
        schedule.wednesday.start, schedule.wednesday.end,
        schedule.thursday.start, schedule.thursday.end,
        schedule.friday.start, schedule.friday.end,
        schedule.saturday.start, schedule.saturday.end,
        schedule.sunday.start, schedule.sunday.end
      ]
    );

    return this.mapDbRowToRoom(result.rows[0]);
  }

  async updateRoom(data: UpdateRoomRequest): Promise<RoomWithSchedule | null> {
    const { idRoom, schedule, ...updateData } = data;

    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    // Standard fields
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = $${i++}`);
        values.push(value);
      }
    }

    // Schedule fields
    if (schedule) {
      const normalized = this.normalizeSchedule(schedule);
      for (const day of this.Days) {
        fields.push(`${day}_start = $${i++}`);
        values.push(normalized[day].start);
        fields.push(`${day}_end = $${i++}`);
        values.push(normalized[day].end);
      }
    }

    if (!fields.length) return this.getRoomById(idRoom);

    values.push(idRoom);

    const result = await query(
      `UPDATE rooms SET ${fields.join(', ')} WHERE id_room = $${i} AND is_exists = TRUE RETURNING *`,
      values
    );

    if (!result.rows.length) return null;

    const room = this.mapDbRowToRoom(result.rows[0]);

    // Arduino sync si temp modifiée
    const tempUpdated = updateData.minTemp !== undefined || updateData.maxTemp !== undefined;
    if (tempUpdated && room.ipArduino) {
      await this.syncTempConfigToArduino(room);
    }

    return room;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE rooms SET is_exists = FALSE WHERE id_room = $1 AND is_exists = TRUE',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /** Arduino sync */
  async syncTempConfigToArduino(room: Rooms): Promise<{ success: boolean; error?: string }> {
    if (!room.ipArduino) return { success: false, error: 'Pas d’adresse IP Arduino configurée' };
    if (room.minTemp === null || room.maxTemp === null) return { success: false, error: 'Températures non définies' };
    try {
      await this.sendToArduino(room.ipArduino, '/temp', { mintemp: room.minTemp, maxtemp: room.maxTemp });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, error: message };
    }
  }

  private async sendToArduino(ipArduino: string, endpoint: string, data: unknown): Promise<void> {
    const url = `http://${ipArduino}${endpoint}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Arduino a répondu avec le statut ${res.status}`);
  }

  private camelToSnake(str: string) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
