import { Injectable } from '@angular/core';
import { Room } from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  // Simule les salles déjà existantes dans la base
  private rooms: Room[] = [
    new Room('1', '101', 50, 20, 1, 2, 1000, 20, 25, true  ),
    new Room('2', '102', 40, 15, 1, 1, 900, 19, 24, true),
    new Room('3', '103', 50, 20, 1, 2, 1000, 20, 25, true  ),
    new Room('4', '104', 40, 15, 1, 1, 900, 19, 24, true),
    new Room('6', '106', 50, 20, 1, 2, 1000, 20, 25, true  ),
    new Room('7', '107', 40, 15, 1, 1, 900, 19, 24, true),
    new Room('8', '108', 40, 15, 1, 1, 900, 19, 24, true),
  ];

  private idCounter: number;

  constructor() {
    // Initialiser le compteur à partir du dernier ID existant
    this.idCounter = this.rooms.length > 0
      ? Math.max(...this.rooms.map(r => Number(r.id))) + 1
      : 1;
  }

  createRoom(name: string): { success: boolean; message: string; room?: Room } {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, message: 'Nom vide' };

    const exists = this.rooms.some(r => r.name === trimmedName);
    if (exists) return { success: false, message: 'Salle existante' };

    const newId = this.idCounter.toString(); // Auto-incrément
    this.idCounter++;

    const newRoom = new Room(newId, trimmedName, 0,0,0,0,0,0,0,true);
    this.rooms.push(newRoom);
    this.rooms.sort((a, b) => Number(a.name) - Number(b.name));

    return { success: true, message: 'Salle créée avec succès', room: newRoom };
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.find(r => r.id === id);
  }
}
