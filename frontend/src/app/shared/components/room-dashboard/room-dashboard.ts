import { Component, OnInit } from '@angular/core';
import {Footer} from "../footer/footer";
import {Header} from "../header/header";
import {ActivatedRoute} from '@angular/router';
import {Room} from '../../../models/room';
import {RoomsService} from '../../../services/rooms.service';
import {Sensor} from '../../../models/sensor';
import {RoomSensorsService} from '../../../services/roomSensors.service';
import {SensorGraph} from '../sensor-graph/sensor-graph';

@Component({
  selector: 'app-room-dashboard',
  imports: [
    Footer,
    Header,
    SensorGraph,
  ],
  templateUrl: './room-dashboard.html',
  styleUrl: './room-dashboard.scss',
})
export class RoomDashboard implements OnInit {
  room!: Room;
  sensors: Sensor[] = [];

  constructor(
    private route: ActivatedRoute,
    private roomsService: RoomsService,
    private roomSensorsService: RoomSensorsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const r = this.roomsService.getRoomById(id);
    if (!r) return;

    this.room = r;

    this.roomSensorsService.getSensorsByRoom(this.room).subscribe(sensors => {
      console.log(r);
      this.sensors = sensors || [];
    });
  }

  getSensorColor(sensorType: string): string {
    switch(sensorType) {
      case 'Temperature': return 'rgba(255,99,132,1)';
      case 'CO2': return 'rgba(54,162,235,1)';
      default: return 'rgba(0,0,0,1)';
    }
  }

}
