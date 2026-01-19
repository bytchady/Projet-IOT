import { Component, signal } from '@angular/core';
import { RoomCard } from './shared/components/room-card/room-card';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RoomCard
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
