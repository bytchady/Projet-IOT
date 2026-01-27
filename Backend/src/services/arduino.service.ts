import { query } from '../config/database.js';
import { ArduinoPublishRequest, MeasurementData, Room } from '../models/types.js';
import { NotFoundError } from '../utils/errors.js';

export class ArduinoService {
  async saveMeasurement(data: ArduinoPublishRequest): Promise<MeasurementData> {
    // Verify room exists
    const roomResult = await query<Room>(
      'SELECT * FROM salle WHERE id_room = $1 AND is_exists = TRUE',
      [data.id_room]
    );

    if (roomResult.rows.length === 0) {
      throw new NotFoundError('Room not found');
    }

    // Insert measurement
    const result = await query<MeasurementData>(
      `INSERT INTO donnee_mesure (timestamp, value_co2, value_temp, value_hum, clim_status, id_room)
       VALUES (NOW(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.value_co2 ?? null,
        data.value_temp ?? null,
        data.value_hum ?? null,
        data.clim_status ?? null,
        data.id_room
      ]
    );

    const measurement = result.rows[0];

    // Check thresholds and potentially trigger alerts
    await this.checkThresholds(roomResult.rows[0], measurement);

    return measurement;
  }

  private async checkThresholds(room: Room, measurement: MeasurementData): Promise<void> {
    const alerts: string[] = [];

    // Check CO2 threshold
    if (room.co2_threshold && measurement.value_co2 && measurement.value_co2 > room.co2_threshold) {
      alerts.push(`CO2 level (${measurement.value_co2}) exceeds threshold (${room.co2_threshold})`);
    }

    // Check temperature thresholds
    if (room.min_temp && measurement.value_temp && measurement.value_temp < room.min_temp) {
      alerts.push(`Temperature (${measurement.value_temp}) below minimum (${room.min_temp})`);
    }
    if (room.max_temp && measurement.value_temp && measurement.value_temp > room.max_temp) {
      alerts.push(`Temperature (${measurement.value_temp}) above maximum (${room.max_temp})`);
    }

    // Check humidity thresholds
    if (room.min_hum && measurement.value_hum && measurement.value_hum < room.min_hum) {
      alerts.push(`Humidity (${measurement.value_hum}) below minimum (${room.min_hum})`);
    }
    if (room.max_hum && measurement.value_hum && measurement.value_hum > room.max_hum) {
      alerts.push(`Humidity (${measurement.value_hum}) above maximum (${room.max_hum})`);
    }

    if (alerts.length > 0) {
      console.log(`[ALERT] Room ${room.name_room} (${room.id_room}):`, alerts);
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
