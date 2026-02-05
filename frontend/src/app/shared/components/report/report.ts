// import { Component, OnInit } from '@angular/core';
// import { Room } from '../../../models/room';
// import { RoomsServices } from '../../../services/rooms/rooms.service';
// import { DataServices } from '../../../services/data/data.services';
// import { Footer } from '../footer/footer';
// import { SensorGraph } from '../sensor-graph/sensor-graph';
// import { FormsModule } from '@angular/forms';
// import { Header } from '../header/header';
// import { DecimalPipe } from '@angular/common';
// import { lastValueFrom } from 'rxjs';
// import { Data } from '../../../models/data';
//
// interface TopRoom {
//   room: Room;
//   loss: number;
//   data: Data[];
// }
//
// @Component({
//   selector: 'app-report',
//   imports: [Footer, SensorGraph, FormsModule, Header, DecimalPipe],
//   templateUrl: './report.html',
//   styleUrls: ['./report.scss'],
// })
// export class Report implements OnInit {
//   startDate!: Date;
//   endDate!: Date;
//   startDateString!: string;
//   endDateString!: string;
//
//   topRooms: TopRoom[] = [];
//   rooms: Room[] = [];
//   isLoading: boolean = false;
//
//   constructor(
//     private dataService: DataServices,
//     private roomsService: RoomsServices
//   ) {}
//
//   async ngOnInit() {
//     const today = new Date();
//     this.startDate = today;
//     this.endDate = today;
//     this.startDateString = today.toISOString().substring(0, 10);
//     this.endDateString = today.toISOString().substring(0, 10);
//
//     try {
//       this.rooms = await lastValueFrom(this.roomsService.getRooms());
//       await this.computeTopRooms();
//     } catch (err) {
//       console.error('Erreur lors de la récupération des salles', err);
//     }
//   }
//
//   async onStartDateChange() {
//     this.startDate = new Date(this.startDateString);
//     if (this.endDateString && this.startDateString > this.endDateString) {
//       this.endDateString = this.startDateString;
//       this.endDate = new Date(this.endDateString);
//     }
//     await this.computeTopRooms();
//   }
//
//   async onEndDateChange() {
//     this.endDate = new Date(this.endDateString);
//     if (this.startDateString && this.endDateString < this.startDateString) {
//       this.startDateString = this.endDateString;
//       this.startDate = new Date(this.startDateString);
//     }
//     await this.computeTopRooms();
//   }
//
//   async computeTopRooms() {
//     this.isLoading = true;
//
//     const promises = this.rooms.map(async room => {
//       try {
//         const measures = await lastValueFrom(
//           this.dataService.getDataByDateRange(
//             room.idRoom,
//             this.startDate,
//             this.endDate
//           )
//         );
//
//         const safeMeasures: Data[] = measures ?? [];
//         const loss = this.calculateLoss(room, safeMeasures);
//
//         return { room, loss, data: safeMeasures };
//
//       } catch (err) {
//         console.error(`Erreur récupération mesures pour ${room.nameRoom}`, err);
//         return { room, loss: 0, data: [] as Data[] };
//       }
//     });
//
//     this.topRooms = (await Promise.all(promises))
//       .sort((a, b) => b.loss - a.loss)
//       .slice(0, 3);
//
//     this.isLoading = false;
//   }
//
//   calculateLoss(room: Room, measures: Data[]): number {
//     const factorDoors = 0.5;
//     const factorWalls = 0.8;
//     const factorGlass = 1.0;
//
//     let totalLoss = 0;
//     measures.forEach(m => {
//       if (m.valueTemp === null) return;
//
//       const deltaTemp = Math.max(room.maxTemp - m.valueTemp, 0);
//       const structureFactor =
//         factorGlass * room.glazedSurface +
//         factorDoors * room.nbDoors +
//         factorWalls * room.nbExteriorWalls;
//
//       totalLoss += deltaTemp * structureFactor * room.volumeRoom;
//     });
//
//     return Math.round(totalLoss);
//   }
//
//   getSensorColor(type: string) {
//     switch (type) {
//       case 'Temperature': return 'rgba(255,99,132,1)';
//       case 'CO2': return 'rgba(54,162,235,1)';
//       case 'Humidity': return 'rgba(75,192,92,1)';
//       default: return 'rgba(0,0,0,1)';
//     }
//   }
// }
