import { Component, Input, OnInit } from '@angular/core';
import { Room } from '../../../models/room';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-room-card',
  imports: [
    RouterLink
  ],
  templateUrl: './room-card.html',
  styleUrl: './room-card.scss',
})
export class RoomCard implements OnInit {
  @Input() room! : Room;

  ngOnInit() {
    if (!this.room.name) {
      this.room.name= "Aucune salle";
    }
  }
}
