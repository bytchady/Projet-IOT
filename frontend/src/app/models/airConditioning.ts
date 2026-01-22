import {AirConditioningStatus} from './airConditioningStatus';
import {Room} from './room';


export class AirConditioning {
  constructor(
    public id: number,
    public mac: string,
    public room: Room,
    public status: AirConditioningStatus
  ) {}
}
