import { Component, Input } from '@angular/core';
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
export class RoomCard {
  @Input() room! : Room;
}
