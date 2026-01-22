import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {Room} from '../models/room';
import {Sensor} from '../models/sensor';
import {SensorStatus} from '../models/sensorStatus';
import {SensorType} from '../models/sensorType';

@Injectable({
  providedIn: 'root'
})
export class RoomSensorsService {

  constructor() { }

  getSensorsByRoom(room: Room): Observable<Sensor[]> {
    const sensors: Sensor[] = [
      new Sensor(1, new SensorStatus(1, 'Active', new Date()), new SensorType(1, 'Temperature'), room),
      new Sensor(2, new SensorStatus(1, 'Active', new Date()), new SensorType(2, 'CO2'), room),
    ];
    return of(sensors);
  }
}
