import { query } from '../config/database.js';
import { ArduinoMeasurement, MeasurementData, Rooms } from '../models/types.js';
import { NotFoundError } from '../utils/errors.js';

export class ArduinoService {
  async saveMeasurements(ip: string, measurements: ArduinoMeasurement[]): Promise<MeasurementData[]> {
    // Find room by Arduino IP
    const roomResult = await query<Rooms>(
      'SELECT * FROM rooms WHERE ip_arduino = $1 AND is_exists = TRUE',
      [ip]
    );

    if (roomResult.rows.length === 0) {
      throw new NotFoundError(`No room found for Arduino IP: ${ip}`);
    }

    const room = roomResult.rows[0];
    const idRoom = room.id_room;
    const saved: MeasurementData[] = [];

    for (const data of measurements) {
      const result = await query<MeasurementData>(
        `INSERT INTO data (timestamp, value_co2, value_temp, value_hum, clim_status, id_room)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          data.timestamp ?? new Date().toISOString(),
          data.valueCO2 ?? null,
          data.valueTemp ?? null,
          data.valueHum ?? null,
          data.climStatus ?? null,
          idRoom
        ]
      );

      const measurement = result.rows[0];
      saved.push(measurement);

      // Check thresholds
      await this.checkThresholds(room, measurement);
    }

    return saved;
  }

  private async checkThresholds(room: Rooms, measurement: MeasurementData): Promise<void> {
    const alerts: string[] = [];

    if (room.min_temp && measurement.value_temp && measurement.value_temp < room.min_temp) {
      alerts.push(`Temperature (${measurement.value_temp}) below minimum (${room.min_temp})`);
    }
    if (room.max_temp && measurement.value_temp && measurement.value_temp > room.max_temp) {
      alerts.push(`Temperature (${measurement.value_temp}) above maximum (${room.max_temp})`);
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
