import {Sensor} from './sensor';

export class Measure {
  constructor(
    public id: number,
    public value: number,
    public timestamp: Date,
    public sensor: Sensor
  ) {}
}
