import { ArduinoTempConfig, ArduinoHoursConfig } from '../models/types.js';

/**
 * Service pour communiquer avec l'Arduino (appels HTTP sortants)
 * Le backend envoie des configurations à l'Arduino
 */
export class ArduinoClientService {
  private timeout = 5000; // 5 seconds timeout

  /**
   * Envoie la configuration de température à l'Arduino
   * PATCH http://{ip_arduino}/temp
   */
  async sendTempConfig(ipArduino: string, config: ArduinoTempConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `http://${ipArduino}/temp`;
      console.log(`Sending temp config to Arduino at ${url}:`, config);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mintemp: config.min_temp,
          maxtemp: config.max_temp
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `Arduino responded with status ${response.status}`
        };
      }

      console.log(`Temp config sent successfully to Arduino at ${ipArduino}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send temp config to Arduino at ${ipArduino}:`, errorMessage);
      return {
        success: false,
        error: `Failed to connect to Arduino: ${errorMessage}`
      };
    }
  }

  /**
   * Envoie la configuration des horaires à l'Arduino
   * PATCH http://{ip_arduino}/hours
   */
  async sendHoursConfig(ipArduino: string, config: ArduinoHoursConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const url = `http://${ipArduino}/hours`;
      console.log(`Sending hours config to Arduino at ${url}:`, config);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Format schedules for Arduino
      const hoursPayload: Record<string, { start: string; end: string }> = {};
      for (const schedule of config.schedules) {
        const dayKey = schedule.day_of_week.toLowerCase();
        hoursPayload[dayKey] = {
          start: schedule.start_time,
          end: schedule.end_time
        };
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hoursPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `Arduino responded with status ${response.status}`
        };
      }

      console.log(`Hours config sent successfully to Arduino at ${ipArduino}`);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to send hours config to Arduino at ${ipArduino}:`, errorMessage);
      return {
        success: false,
        error: `Failed to connect to Arduino: ${errorMessage}`
      };
    }
  }

  /**
   * Vérifie si l'Arduino est accessible
   */
  async ping(ipArduino: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`http://${ipArduino}/`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const arduinoClient = new ArduinoClientService();