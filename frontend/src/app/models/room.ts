export class Room {
  id: string;
  constructor(
    public name: string,
    public volume: number,
    public glazedSurface: number,
    public nbDoors: number,
    public nbExteriorWalls: number,
    public co2Threshold: number,
    public minTempConfort: number,
    public maxTempConfort: number,
    public isExists: boolean,) {
    this.id = crypto.randomUUID().substring(0, 8);
  }
}
