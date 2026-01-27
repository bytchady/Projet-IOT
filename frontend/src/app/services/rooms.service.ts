import { Injectable } from '@angular/core';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  // Simule les salles déjà existantes dans la base
  // TODO: Get les salles en backend
  private rooms: Room[] = [
    new Room(
      '192.168.0.101',
      'Room 101',
      50,
      20,
      1,
      2,
      20,
      25,
      {
        monday: { start: '08:00', end: '18:00' },
        tuesday: { start: '08:00', end: '18:00' },
        wednesday: { start: '08:00', end: '18:00' },
        thursday: { start: '08:00', end: '18:00' },
        friday: { start: '08:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: { start: '10:00', end: '16:00' }
      },
      true
    ),

    new Room(
      '192.168.0.102',
      'Room 102',
      40,
      15,
      1,
      1,
      19,
      24,
      {
        monday: { start: '07:30', end: '17:30' },
        tuesday: { start: '07:30', end: '17:30' },
        wednesday: { start: '07:30', end: '17:30' },
        thursday: { start: '07:30', end: '17:30' },
        friday: { start: '07:30', end: '17:30' },
        saturday: { start: '09:00', end: '14:00' },
        sunday: { start: '09:00', end: '14:00' }
      },
      true
    ),

    new Room(
      '192.168.0.103',
      'Room 103',
      50,
      20,
      1,
      2,
      20,
      25,
      {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '08:00', end: '18:00' },
        thursday: { start: '08:00', end: '18:00' },
        friday: { start: '08:00', end: '18:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: { start: '10:00', end: '16:00' }
      },
      true
    )
  ];

  getRooms(): Room[] {
    return this.rooms.filter(r => r.isExists);
  }

  // TODO: Création de salle en backend
  createRoom(name: string): { success: boolean; message: string; room?: Room } {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, message: 'Nom vide' };

    const exists = this.rooms.some(r => r.nameRoom === trimmedName);
    if (exists) return { success: false, message: 'Salle déja existante' };

    const newRoom = new Room(
      '0.0.0.0', // ipArduino par défaut
      trimmedName, // nom de la room
      0, // volumeRoom
      0, // glazedSurface
      0, // nbDoors
      0, // nbExteriorWalls
      0, // minTemp
      0, // maxTemp
      {
        monday: { start: '00:00', end: '00:00' },
        tuesday: { start: '00:00', end: '00:00' },
        wednesday: { start: '00:00', end: '00:00' },
        thursday: { start: '00:00', end: '00:00' },
        friday: { start: '00:00', end: '00:00' },
        saturday: { start: '00:00', end: '00:00' },
        sunday: { start: '00:00', end: '00:00' }
      },
      true // isExists
    );

    this.rooms.push(newRoom);
    this.rooms.sort((a, b) => Number(a.nameRoom) - Number(b.nameRoom));

    return { success: true, message: 'Salle créée avec succès', room: newRoom };
  }

  // TODO: Suppression de salle en backend
  deleteRoom(id: string): boolean {
    const room = this.rooms.find(r => r.idRoom === id);
    if (!room) return false;

    room.isExists = false;
    return true;
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.find(r => r.idRoom === id);
  }
}
