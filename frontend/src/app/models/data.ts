// import {Room} from './room';
//
// export class Data {
//   constructor(
//     public idData: number,
//     public timestamp: Date,
//     public valueCO2: number,
//     public valueTemp: number,
//     public valueHum: number,
//     public climStatus: Boolean,
//     public room: Room
//   ) {}
// }
export interface Data {
  idData: number;
  timestamp: Date;
  valueCO2: number | null;
  valueTemp: number | null;
  valueHum: number | null;
  climStatus: boolean | null;
  idRoom: string;
}
