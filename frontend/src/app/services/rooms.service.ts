import { Injectable } from '@angular/core';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  // Simule les salles déjà existantes dans la base
  // TODO: Get les salles en backend
  private rooms: Room[] = [
    new Room( '101', 50, 20, 1, 2, 1000, 20, 25, 20, 25,true  ),
    new Room( '102', 40, 15, 1, 1, 900, 19, 24, 20, 25,true),
    new Room( '103', 50, 20, 1, 2, 1000, 20, 25, 20, 25,true  ),
    new Room('104', 40, 15, 1, 1, 900, 19, 24, 20, 25,true),
    new Room('106', 50, 20, 1, 2, 1000, 20, 25, 20, 25,true  ),
    new Room('107', 40, 15, 1, 1, 900, 19, 24, 20, 25,true),
    new Room('108', 40, 15, 1, 1, 900, 19, 24, 20, 25,true),
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

    const newRoom = new Room(trimmedName, 0,0,0,0,0,0,0,0,0,true);
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
