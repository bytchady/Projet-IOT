import {Injectable} from '@angular/core';
import {Measure} from '../models/measure';
import {Observable, of} from 'rxjs';
import {Sensor} from '../models/sensor';


@Injectable({
  providedIn: 'root'
})
export class MeasuresService {

  constructor() { }

  // Simulate 1 minute measurements for a sensor for 24h
  getMeasuresBySensor(sensor: Sensor, hours: number = 24): Observable<Measure[]> {
    const measurements: Measure[] = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0); // start at 00:00

    for (let h = 0; h < hours; h++) {
      for (let m = 0; m < 60; m++) {
        let value = 0;
        switch (sensor.type.name) {
          case 'Temperature':
            value = 20 + Math.random() * 5; // 20-25°C
            break;
          case 'CO2':
            value = 400 + Math.random() * 800; // 400-1200 ppm
            break;
        }

        measurements.push(new Measure(
          h * 60 + m + 1,
          parseFloat(value.toFixed(2)),
          new Date(start.getTime() + h * 60 * 60000 + m * 60000),
          sensor
        ));
      }
    }

    return of(measurements);
  }
}
