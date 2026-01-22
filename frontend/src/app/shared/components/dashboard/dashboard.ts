import { Component } from '@angular/core';
import {Footer} from "../footer/footer";
import {Header} from "../header/header";
import {SensorGraph} from "../sensor-graph/sensor-graph";
import {HomeComponent} from '../home-component/home-component';
import {RoomDashboard} from '../room-dashboard/room-dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [
    Footer,
    Header,
    SensorGraph,
    HomeComponent,
    RoomDashboard
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

}
