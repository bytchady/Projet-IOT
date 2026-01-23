import {Room} from './room';
import {SensorStatus} from './sensorStatus';
import {SensorType} from './sensorType';

export class Sensor {
  constructor(
    public id: string,
    public isExists: boolean,
    public status: SensorStatus,
    public type: SensorType,
    public room: Room
  ) {}
}
