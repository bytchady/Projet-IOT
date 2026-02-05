import { query } from '../config/database.js';
import { MeasurementData } from '../models/types.js';

export class DataService {
  private mapDbRowToMeasurement(row: any): MeasurementData {
    return {
      idData: row.id_data,
      timestamp: new Date(row.timestamp),
      valueCO2: row.value_co2,
      valueTemp: parseFloat(row.value_temp),
      valueHum: parseFloat(row.value_hum),
      climStatus: row.clim_status,
      idRoom: row.id_room
    };
  }

  /**
   * Récupère toutes les données d'aujourd'hui pour une salle
   * Utilisé par: room-dashboard
   */
  async getDataForToday(roomId: string): Promise<MeasurementData[]> {
    const result = await query(
      `SELECT * FROM data
       WHERE id_room = $1
         AND DATE(timestamp) = CURRENT_DATE
       ORDER BY timestamp ASC`,
      [roomId]
    );
    return result.rows.map(row => this.mapDbRowToMeasurement(row));
  }

  /**
   * Récupère les données entre deux dates pour une salle
   * Utilisé par: rapport (pour une seule salle)
   */
  async getDataByDateRange(
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MeasurementData[]> {
    // Ajouter 23h59m59s à endDate pour inclure toute la journée
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await query(
      `SELECT * FROM data
       WHERE id_room = $1
         AND timestamp BETWEEN $2 AND $3
       ORDER BY timestamp ASC`,
      [roomId, startDate, endOfDay]
    );
    return result.rows.map(row => this.mapDbRowToMeasurement(row));
  }

  /**
   * Récupère les données pour plusieurs salles sur une période
   * Utilisé par: rapport (pour top 3)
   */
  async getDataForMultipleRooms(
    roomIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Map<string, MeasurementData[]>> {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await query(
      `SELECT * FROM data
       WHERE id_room = ANY($1)
       AND timestamp BETWEEN $2 AND $3
       ORDER BY id_room, timestamp ASC`,
      [roomIds, startDate, endOfDay]
    );

    // Grouper par roomId
    const dataByRoom = new Map<string, MeasurementData[]>();

    result.rows.forEach(row => {
      const measurement = this.mapDbRowToMeasurement(row);
      const roomId = measurement.idRoom;

      if (!dataByRoom.has(roomId)) {
        dataByRoom.set(roomId, []);
      }
      dataByRoom.get(roomId)!.push(measurement);
    });

    return dataByRoom;
  }
}
