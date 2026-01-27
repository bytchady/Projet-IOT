import { query } from '../config/database.js';
import { RoomSchedule } from '../models/types.js';

export class HoursService {
  // Get all schedules for a room
  async getSchedulesByRoom(roomId: string): Promise<RoomSchedule[]> {
    const result = await query<RoomSchedule>(
      `SELECT * FROM horaire_salle
       WHERE id_room = $1
       ORDER BY CASE day_of_week
         WHEN 'Monday' THEN 1
         WHEN 'Tuesday' THEN 2
         WHEN 'Wednesday' THEN 3
         WHEN 'Thursday' THEN 4
         WHEN 'Friday' THEN 5
         WHEN 'Saturday' THEN 6
         WHEN 'Sunday' THEN 7
       END`,
      [roomId]
    );
    return result.rows;
  }

  // Set/update schedules for a room (replaces all existing)
  async setSchedules(roomId: string, schedules: Omit<RoomSchedule, 'id_horaire' | 'id_room'>[]): Promise<RoomSchedule[]> {
    // Delete existing schedules for this room
    await query('DELETE FROM horaire_salle WHERE id_room = $1', [roomId]);

    // Insert new schedules
    const insertedSchedules: RoomSchedule[] = [];

    for (const schedule of schedules) {
      const result = await query<RoomSchedule>(
        `INSERT INTO horaire_salle (day_of_week, start_time, end_time, id_room)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [schedule.day_of_week, schedule.start_time, schedule.end_time, roomId]
      );
      insertedSchedules.push(result.rows[0]);
    }

    return insertedSchedules;
  }

  // Update a single schedule entry
  async updateSchedule(scheduleId: number, updates: Partial<Omit<RoomSchedule, 'id_horaire' | 'id_room'>>): Promise<RoomSchedule | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.day_of_week !== undefined) {
      fields.push(`day_of_week = $${paramIndex++}`);
      values.push(updates.day_of_week);
    }
    if (updates.start_time !== undefined) {
      fields.push(`start_time = $${paramIndex++}`);
      values.push(updates.start_time);
    }
    if (updates.end_time !== undefined) {
      fields.push(`end_time = $${paramIndex++}`);
      values.push(updates.end_time);
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(scheduleId);
    const result = await query<RoomSchedule>(
      `UPDATE horaire_salle SET ${fields.join(', ')} WHERE id_horaire = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Delete a single schedule
  async deleteSchedule(scheduleId: number): Promise<boolean> {
    const result = await query('DELETE FROM horaire_salle WHERE id_horaire = $1', [scheduleId]);
    return (result.rowCount ?? 0) > 0;
  }

  // Add a single schedule to a room
  async addSchedule(roomId: string, schedule: Omit<RoomSchedule, 'id_horaire' | 'id_room'>): Promise<RoomSchedule> {
    const result = await query<RoomSchedule>(
      `INSERT INTO horaire_salle (day_of_week, start_time, end_time, id_room)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [schedule.day_of_week, schedule.start_time, schedule.end_time, roomId]
    );
    return result.rows[0];
  }
}
