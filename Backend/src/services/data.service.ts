import { query } from '../config/database.js';
import { MeasurementData } from '../models/types.js';

export class DataService {
  async getDataByHour(roomId: string, hours: number): Promise<MeasurementData[]> {
    const result = await query<MeasurementData>(
      `SELECT * FROM donnee_mesure
       WHERE id_room = $1
       AND timestamp >= NOW() - INTERVAL '${hours} hours'
       ORDER BY timestamp DESC`,
      [roomId]
    );
    return result.rows;
  }

  async getAllData(roomId: string, limit: number = 100): Promise<MeasurementData[]> {
    const result = await query<MeasurementData>(
      `SELECT * FROM donnee_mesure
       WHERE id_room = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [roomId, limit]
    );
    return result.rows;
  }

  async getLatestData(roomId: string): Promise<MeasurementData | null> {
    const result = await query<MeasurementData>(
      `SELECT * FROM donnee_mesure
       WHERE id_room = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [roomId]
    );
    return result.rows[0] || null;
  }

  async getDataByDateRange(roomId: string, startDate: Date, endDate: Date): Promise<MeasurementData[]> {
    const result = await query<MeasurementData>(
      `SELECT * FROM donnee_mesure
       WHERE id_room = $1
       AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp DESC`,
      [roomId, startDate, endDate]
    );
    return result.rows;
  }

  async getAverageData(roomId: string, hours: number): Promise<{ avg_temp: number; avg_hum: number; avg_co2: number } | null> {
    const result = await query<{ avg_temp: string; avg_hum: string; avg_co2: string }>(
      `SELECT
        AVG(value_temp) as avg_temp,
        AVG(value_hum) as avg_hum,
        AVG(value_co2) as avg_co2
       FROM donnee_mesure
       WHERE id_room = $1
       AND timestamp >= NOW() - INTERVAL '${hours} hours'`,
      [roomId]
    );

    const row = result.rows[0];
    if (!row || (row.avg_temp === null && row.avg_hum === null && row.avg_co2 === null)) {
      return null;
    }

    return {
      avg_temp: parseFloat(row.avg_temp) || 0,
      avg_hum: parseFloat(row.avg_hum) || 0,
      avg_co2: parseFloat(row.avg_co2) || 0
    };
  }
}
