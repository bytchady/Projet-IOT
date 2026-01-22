import {Room} from './room';
import {AlertType} from './alertType';

export class Alert {
  constructor(
    public id: number,
    public startTimestamp: Date,
    public endTimestamp: Date,
    public nbMeasurements: number,
    public state: string,
    public severity: string,
    public type: AlertType,
    public room: Room
  ) {}
}
