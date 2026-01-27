import { Component } from '@angular/core';
import {Footer} from "../footer/footer";
import {Header} from "../header/header";
import {RoomDashboard} from '../room-dashboard/room-dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [
    Footer,
    Header,
    RoomDashboard
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

}
