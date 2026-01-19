import { Component, signal } from '@angular/core';
import { RoomCard } from './shared/components/room-card/room-card';
import { Logo } from './shared/components/logo/logo';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    //RoomCard
    Logo
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
