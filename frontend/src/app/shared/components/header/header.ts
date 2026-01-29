import { Component } from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {Logo} from "../logo/logo";
import {ModeComponent} from "../mode-component/mode-component";
import {ServerMessage} from "../server-message/server-message";
import {ServerMessagesServices} from '../../../services/server-messages/server-messages.services';
import {LogoutButton} from '../logout-button/logout-button';

@Component({
  selector: 'app-header',
  imports: [
    AsyncPipe,
    Logo,
    ModeComponent,
    ServerMessage,
    LogoutButton
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(public serverMessageService: ServerMessagesServices) {}
}
