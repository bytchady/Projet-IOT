import { Component, signal } from '@angular/core';
import { Logo } from './shared/components/logo/logo';
import { Footer } from './shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './shared/components/home-component/home-component';
import { ModeComponent } from './shared/components/mode-component/mode-component';
import { ServerMessage } from './shared/components/server-message/server-message';
import { ServerMessageService } from './services/serverMessages.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    Logo,
    Footer,
    ModeComponent,
    HomeComponent,
    ServerMessage,
    AsyncPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(public serverMessageService: ServerMessageService) {}
}
