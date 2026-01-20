import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-room-card',
  imports: [],
  templateUrl: './room-card.html',
  styleUrl: './room-card.scss',
})
export class RoomCard implements OnInit {
  @Input() nameRoom!: string;

  ngOnInit() {
    if (!this.nameRoom) {
      this.nameRoom = "Aucune salle";
    }
  }
}
