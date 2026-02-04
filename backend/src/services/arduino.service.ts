import { query } from '../config/database.js';
import { ArduinoPublishRequest, MeasurementData, Rooms } from '../models/types.js';
import { NotFoundError } from '../utils/errors.js';

export class ArduinoService {
  async saveMeasurement(data: ArduinoPublishRequest): Promise<MeasurementData> {
    // Verify room exists
    const roomResult = await query<Rooms>(
      'SELECT * FROM salle WHERE id_room = $1 AND is_exists = TRUE',
      [data.idRoom]
    );

    if (roomResult.rows.length === 0) {
      throw new NotFoundError('Room not found');
    }

    // Insert measurement
    const result = await query<MeasurementData>(
      `INSERT INTO data (timestamp, value_co2, value_temp, value_hum, clim_status, id_room)
       VALUES (NOW(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.valueCO2 ?? null,
        data.valueTemp ?? null,
        data.climStatus ?? null,
        data.idRoom
      ]
    );

    const measurement = result.rows[0];

    // Check thresholds and potentially trigger alerts
    await this.checkThresholds(roomResult.rows[0], measurement);

    return measurement;
  }

  private async checkThresholds(room: Rooms, measurement: MeasurementData): Promise<void> {
    const alerts: string[] = [];
    // Check temperature thresholds
    if (room.minTemp && measurement.valueTemp && measurement.valueTemp < room.minTemp) {
      alerts.push(`Temperature (${measurement.valueTemp}) below minimum (${room.minTemp})`);
    }
    if (room.maxTemp && measurement.valueTemp && measurement.valueTemp > room.maxTemp) {
      alerts.push(`Temperature (${measurement.valueTemp}) above maximum (${room.maxTemp})`);
    }

    if (alerts.length > 0) {
      console.log(`[ALERT] Room ${room.nameRoom} (${room.idRoom}):`, alerts);
    }
  }

  async sendConfigToArduino(ipArduino: string, config: { min_temp?: number; max_temp?: number }): Promise<boolean> {
    try {
      const response = await fetch(`http://${ipArduino}/temp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to send config to Arduino:', error);
      return false;
    }
  }

  async sendScheduleToArduino(ipArduino: string, schedules: { day_of_week: string; start_time: string; end_time: string }[]): Promise<boolean> {
    try {
      const response = await fetch(`http://${ipArduino}/hours`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules })
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to send schedule to Arduino:', error);
      return false;
    }
  }
}
