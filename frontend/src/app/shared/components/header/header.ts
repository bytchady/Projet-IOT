import { Component } from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {Logo} from "../logo/logo";
import {ModeComponent} from "../mode-component/mode-component";
import {ServerMessage} from "../server-message/server-message";
import {ServerMessageService} from '../../../services/serverMessages.service';

@Component({
  selector: 'app-header',
    imports: [
        AsyncPipe,
        Logo,
        ModeComponent,
        ServerMessage
    ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(public serverMessageService: ServerMessageService) {}
}
