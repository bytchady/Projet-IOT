import { FastifyRequest, FastifyReply } from 'fastify';
import { HoursService } from '../services/hours.service.js';
import { RoomsService } from '../services/rooms.service.js';
import { RoomSchedule } from '../models/types.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

type ScheduleInput = Omit<RoomSchedule, 'id_horaire' | 'id_room'>;

export class HoursController {
  private hoursService: HoursService;
  private roomsService: RoomsService;

  constructor() {
    this.hoursService = new HoursService();
    this.roomsService = new RoomsService();
  }

  // GET /api/room/:id/hours
  async getSchedules(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const schedules = await this.hoursService.getSchedulesByRoom(id);
      return reply.send(schedules);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  // PUT /api/room/:id/hours - Replace all schedules for a room
  async setSchedules(
    request: FastifyRequest<{ Params: { id: string }; Body: { schedules: ScheduleInput[] } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { schedules } = request.body;

      if (!schedules || !Array.isArray(schedules)) {
        throw new BadRequestError('schedules array is required');
      }

      const updatedSchedules = await this.hoursService.setSchedules(id, schedules);

      // Sync to Arduino
      const room = await this.roomsService.getRoomById(id);
      let arduinoSync = { success: false, error: 'Room not found' };
      if (room) {
        arduinoSync = await this.roomsService.syncHoursConfigToArduino(room);
      }

      return reply.status(201).send({
        message: 'Schedules updated successfully',
        schedules: updatedSchedules,
        arduino_sync: arduinoSync
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        return reply.status(400).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  // POST /api/room/:id/hours - Add a single schedule
  async addSchedule(
    request: FastifyRequest<{ Params: { id: string }; Body: ScheduleInput }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const schedule = request.body;

      const newSchedule = await this.hoursService.addSchedule(id, schedule);

      // Sync to Arduino
      const room = await this.roomsService.getRoomById(id);
      let arduinoSync = { success: false, error: 'Room not found' };
      if (room) {
        arduinoSync = await this.roomsService.syncHoursConfigToArduino(room);
      }

      return reply.status(201).send({
        schedule: newSchedule,
        arduino_sync: arduinoSync
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  // PATCH /api/room/:id/hours/:scheduleId - Update a single schedule
  async updateSchedule(
    request: FastifyRequest<{ Params: { id: string; scheduleId: string }; Body: Partial<ScheduleInput> }>,
    reply: FastifyReply
  ) {
    try {
      const { scheduleId } = request.params;
      const updates = request.body;

      const updatedSchedule = await this.hoursService.updateSchedule(parseInt(scheduleId), updates);

      if (!updatedSchedule) {
        throw new NotFoundError('Schedule not found');
      }

      return reply.send(updatedSchedule);
    } catch (error) {
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }

  // DELETE /api/room/:id/hours/:scheduleId - Delete a single schedule
  async deleteSchedule(
    request: FastifyRequest<{ Params: { id: string; scheduleId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { scheduleId } = request.params;
      const deleted = await this.hoursService.deleteSchedule(parseInt(scheduleId));

      if (!deleted) {
        throw new NotFoundError('Schedule not found');
      }

      return reply.send({ message: 'Schedule deleted successfully' });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return reply.status(404).send({ error: error.message });
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
}
