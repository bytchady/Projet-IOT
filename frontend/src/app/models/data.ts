import {Room} from './room';

export class Data {
  constructor(
    public idData: number,
    public timestamp: Date,
    public valueCO2: number,
    public valueTemp: number,
    public valueHum: number,
    public room: Room
  ) {}
}
