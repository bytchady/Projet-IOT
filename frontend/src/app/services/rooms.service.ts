import { Injectable } from '@angular/core';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private rooms: Room[] = [
    new Room('101', 0,0,0,0,0,0,0,true),
    new Room('102', 0,0,0,0,0,0,0,true),
    new Room('103', 0,0,0,0,0,0,0,true),
    new Room('104', 0,0,0,0,0,0,0,true),
    new Room('105', 0,0,0,0,0,0,0,true),
    new Room('106', 0,0,0,0,0,0,0,true),
    new Room('107', 0,0,0,0,0,0,0,true),
  ];

  getRooms(): Room[] {
    return [...this.rooms].filter(r => r.isExists);
  }

  createRoom(name: string): { success: boolean; message: string; room?: Room } {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, message: 'Nom vide' };

    const exists = this.rooms.some(r => r.name === trimmedName);
    if (exists) return { success: false, message: 'Salle existante' };

    const newRoom = new Room(trimmedName, 0,0,0,0,0,0,0,true);
    this.rooms.push(newRoom);
    this.rooms.sort((a, b) => Number(a.name) - Number(b.name));

    return { success: true, message: 'Salle créée avec succès', room: newRoom };
  }

}
