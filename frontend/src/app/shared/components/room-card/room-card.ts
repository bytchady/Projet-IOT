import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-room-card',
  imports: [],
  templateUrl: './room-card.html',
  styleUrl: './room-card.scss',
})
export class RoomCard implements OnInit {
  nameRoom!: string;

  ngOnInit() {
    this.nameRoom = `106`;
  }
}
