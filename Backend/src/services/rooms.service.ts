import { query } from '../config/database.js';
import { CreateRoomRequest, Rooms, RoomWithSchedule, UpdateRoomRequest, WeekDay } from '../models/types.js';

export class RoomsService {
  private Days: WeekDay[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

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
      schedule: {
        monday: {
          isClosed: row.monday_closed,
          start: row.monday_start ? row.monday_start.toString().slice(0,5) : null,
          end:   row.monday_end   ? row.monday_end.toString().slice(0,5) : null,
        },
        tuesday: {
          isClosed: row.tuesday_closed,
          start: row.tuesday_start ? row.tuesday_start.toString().slice(0,5) : null,
          end:   row.tuesday_end   ? row.tuesday_end.toString().slice(0,5) : null,
        },
        wednesday: {
          isClosed: row.wednesday_closed,
          start: row.wednesday_start ? row.wednesday_start.toString().slice(0,5) : null,
          end:   row.wednesday_end   ? row.wednesday_end.toString().slice(0,5) : null,
        },
        thursday: {
          isClosed: row.thursday_closed,
          start: row.thursday_start ? row.thursday_start.toString().slice(0,5) : null,
          end:   row.thursday_end   ? row.thursday_end.toString().slice(0,5) : null,
        },
        friday: {
          isClosed: row.friday_closed,
          start: row.friday_start ? row.friday_start.toString().slice(0,5) : null,
          end:   row.friday_end   ? row.friday_end.toString().slice(0,5) : null,
        },
        saturday: {
          isClosed: row.saturday_closed,
          start: row.saturday_start ? row.saturday_start.toString().slice(0,5) : null,
          end:   row.saturday_end   ? row.saturday_end.toString().slice(0,5) : null,
        },
        sunday: {
          isClosed: row.sunday_closed,
          start: row.sunday_start ? row.sunday_start.toString().slice(0,5) : null,
          end:   row.sunday_end   ? row.sunday_end.toString().slice(0,5) : null,
        },
      }
    };
  }

  async getAllRooms(): Promise<RoomWithSchedule[]> {
    const result = await query('SELECT * FROM rooms WHERE is_exists = TRUE ORDER BY name_room');
    return result.rows.map(row => this.mapDbRowToRoom(row));
  }

  async getRoomById(id: string): Promise<RoomWithSchedule | null> {
    const result = await query('SELECT * FROM rooms WHERE id_room = $1 AND is_exists = TRUE', [id]);
    if (!result.rows.length) return null;
    return this.mapDbRowToRoom(result.rows[0]);
  }

  async createRoom(data: CreateRoomRequest): Promise<RoomWithSchedule> {
    const values = [
      data.nameRoom,
      data.ipArduino,
      data.volumeRoom,
      data.glazedSurface,
      data.nbDoors,
      data.nbExteriorWalls,
      data.minTemp,
      data.maxTemp,
      data.schedule.monday.start, data.schedule.monday.end, data.schedule.monday.isClosed,
      data.schedule.tuesday.start, data.schedule.tuesday.end, data.schedule.tuesday.isClosed,
      data.schedule.wednesday.start, data.schedule.wednesday.end, data.schedule.wednesday.isClosed,
      data.schedule.thursday.start, data.schedule.thursday.end, data.schedule.thursday.isClosed,
      data.schedule.friday.start, data.schedule.friday.end, data.schedule.friday.isClosed,
      data.schedule.saturday.start, data.schedule.saturday.end, data.schedule.saturday.isClosed,
      data.schedule.sunday.start, data.schedule.sunday.end, data.schedule.sunday.isClosed,
      true
    ];


    const result = await query(
      `INSERT INTO rooms (
        name_room, ip_arduino, volume_room, glazed_surface,
        nb_doors, nb_exterior_walls, min_temp, max_temp,
        monday_start, monday_end, monday_closed,
        tuesday_start, tuesday_end, tuesday_closed,
        wednesday_start, wednesday_end, wednesday_closed,
        thursday_start, thursday_end, thursday_closed,
        friday_start, friday_end, friday_closed,
        saturday_start, saturday_end, saturday_closed,
        sunday_start, sunday_end, sunday_closed,
        is_exists
      )
       VALUES (${values.map((_, idx) => `$${idx + 1}`).join(', ')})
         RETURNING *`,
      values
    );

    return this.mapDbRowToRoom(result.rows[0]);
  }

  async updateRoom(data: UpdateRoomRequest): Promise<RoomWithSchedule | null> {
    const { idRoom, schedule, ...updateData } = data;
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    // 🔹 Champs standards
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = $${i++}`);
        values.push(value);
      }
    }

    if (schedule) {
      for (const day of this.Days) {
        const daySchedule = schedule[day];

        if (!daySchedule) continue; // pas de changement si non fourni

        // Si la salle est fermée, on met start/end à null
        const start = daySchedule.isClosed ? null : daySchedule.start ?? null;
        const end = daySchedule.isClosed ? null : daySchedule.end ?? null;

        fields.push(`${day}_start = $${i++}`);
        values.push(start);

        fields.push(`${day}_end = $${i++}`);
        values.push(end);

        fields.push(`${day}_closed = $${i++}`);
        values.push(daySchedule.isClosed);
      }
    }

    if (!fields.length) return this.getRoomById(idRoom);

    values.push(idRoom);

    const result = await query(
      `UPDATE rooms SET ${fields.join(', ')} WHERE id_room = $${i} AND is_exists = TRUE RETURNING *`,
      values
    );

    if (!result.rows.length) return null;
    return this.mapDbRowToRoom(result.rows[0]);
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
