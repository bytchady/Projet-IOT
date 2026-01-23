import {Sensor} from '../models/sensor';
import {Injectable} from '@angular/core';
import {SensorType} from '../models/sensorType';
import {Room} from '../models/room';
import {Observable, of} from 'rxjs';
import {SensorStatus} from '../models/sensorStatus';

@Injectable({
  providedIn: 'root'
})
export class RoomSensorsService {

  private sensorTypes: SensorType[] = [
    new SensorType(1, 'Temperature'),
    new SensorType(2, 'CO2')
  ];

  private sensors: Sensor[] = [];

  getSensorTypes(): SensorType[] {
    return this.sensorTypes;
  }

  getSensorsByRoom(room: Room): Observable<Sensor[]> {
    return of(
      this.sensors.filter(s => s.room.idRoom === room.idRoom && s.isExists)
    );
  }

  addSensor(uuid: string, typeName: string, room: Room) {
    let type = this.sensorTypes.find(t => t.name.toLowerCase() === typeName.toLowerCase());

    if (!type) {
      type = new SensorType(this.sensorTypes.length + 1, typeName);
      this.sensorTypes.push(type);
    }

    const status = new SensorStatus(1, 'Active', new Date());

    const sensor = new Sensor(
      uuid,
      true,
      status,
      type,
      room
    );

    this.sensors.push(sensor);

    // 🔄 Retourner l'Observable actualisé
    return of(this.sensors.filter(s => s.room.idRoom === room.idRoom && s.isExists));
  }


  deleteSensor(id: string) {
    const sensor = this.sensors.find(s => s.id === id);
    if (sensor) sensor.isExists = false;
  }

  toggleSensorStatus(id: string) {
    const sensor = this.sensors.find(s => s.id === id);
    if (!sensor) return;

    sensor.status.label = sensor.status.label === 'Active'
      ? 'Inactive'
      : 'Active';

    sensor.status.timestamp = new Date();
  }
}
