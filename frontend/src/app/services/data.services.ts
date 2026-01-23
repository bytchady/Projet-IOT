import {Injectable} from '@angular/core';
import {Data} from '../models/data';
import {Observable, of} from 'rxjs';
import {Room} from '../models/room';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() {}

  // Simule des mesures chaque minute pendant X heures pour une salle
  getMeasuresByRoom(room: Room, hours: number = 24): Observable<Data[]> {
    const data: Data[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0); // start at midnight

    let id = 1;

    for (let h = 0; h < hours; h++) {
      for (let m = 0; m < 60; m++) {

        const valueTemp = 20 + Math.random() * 5; // 20–25°C
        const valueCO2 = 400 + Math.random() * 800; // 400–1200 ppm
        const valueHum = 30 + Math.random() * 30; // 30–60%

        const timestamp = new Date(start.getTime() + h * 3600000 + m * 60000);

        data.push(new Data(
          id++,
          timestamp,
          parseFloat(valueCO2.toFixed(2)),
          parseFloat(valueTemp.toFixed(2)),
          parseFloat(valueHum.toFixed(2)),
          room
        ));
      }
    }

    return of(data);
  }
}
