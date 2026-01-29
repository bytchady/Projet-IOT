import {Component, OnInit} from '@angular/core';
import {Room} from '../../../models/room';
import {RoomsServices} from '../../../services/rooms/rooms.service';
import {DataServices} from '../../../services/data/data.services';
import {Footer} from '../footer/footer';
import {SensorGraph} from '../sensor-graph/sensor-graph';
import {FormsModule} from '@angular/forms';
import {Header} from '../header/header';
import {DecimalPipe} from '@angular/common';
import {Data} from '@angular/router';

interface TopRoom {
  room: Room;
  loss: number; // déperdition thermique simulée
  data: Data[];
}
@Component({
  selector: 'app-report',
  imports: [
    Footer,
    SensorGraph,
    FormsModule,
    Header,
    DecimalPipe
  ],
  templateUrl: './report.html',
  styleUrl: './report.scss',
})
export class Report implements OnInit {

  startDate!: string;
  endDate!: string;
  topRooms: TopRoom[] = [];
  rooms: Room[] = [];

  constructor(
    private dataService: DataServices,
    private roomsService: RoomsServices) {}

  ngOnInit() {
    const today = new Date().toISOString().substring(0, 10);
    this.startDate = today;
    this.endDate = today;

    // Récupérer toutes les salles
    this.rooms = this.roomsService.getRooms();
    this.computeTopRooms();
  }

  onStartDateChange() {
    if (this.endDate && this.startDate > this.endDate) this.endDate = this.startDate;
    this.computeTopRooms();
  }

  onEndDateChange() {
    if (this.startDate && this.endDate < this.startDate) this.startDate = this.endDate;
    this.computeTopRooms();
  }

  computeTopRooms() {
    const promises = this.rooms.map(room =>
      this.dataService.getMeasuresByRoom(room).toPromise().then(measures => {
        const safeMeasures = measures || []; // assure que measures n'est jamais undefined
        const loss = this.calculateLoss(room, safeMeasures);
        return { room, loss, data: safeMeasures }; // data = Data[]
      })
    );

    Promise.all(promises).then(results => {
      this.topRooms = results
        .sort((a, b) => b.loss - a.loss)
        .slice(0, 3);
    });
  }
  calculateLoss(room: Room, measures: Data[]): number {
    const factorDoors = 0.5;
    const factorWalls = 0.8;
    const factorGlass = 1.0;

    let totalLoss = 0;
    measures.forEach(m => {
      const deltaTemp = Math.max(room.maxTemp - m['valueTemp'], 0); // TS4111 corrigé
      const structureFactor =
        factorGlass * room.glazedSurface +
        factorDoors * room.nbDoors +
        factorWalls * room.nbExteriorWalls;

      totalLoss += deltaTemp * structureFactor * room.volumeRoom;
    });

    return Math.round(totalLoss);
  }


  getSensorColor(type: string) {
    switch (type) {
      case 'Temperature': return 'rgba(255,99,132,1)';
      case 'CO2': return 'rgba(54,162,235,1)';
      case 'Humidity': return 'rgba(162,235,1,0.6)';
      default: return 'rgba(0,0,0,1)';
    }
  }
}
