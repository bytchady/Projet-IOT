export class Room {
  idRoom: string;
  constructor(
    // public idRoom: string,
    public nameRoom: string,
    public volumeRoom: number,
    public glazedSurface: number,
    public nbDoors: number,
    public nbExteriorWalls: number,
    public co2Threshold: number,
    public minTemp: number,
    public maxTemp: number,
    public minHum: number,
    public maxHum: number,
    public isExists: boolean
  ) {
    this.idRoom = crypto.randomUUID().substring(0, 8);
  }
}
