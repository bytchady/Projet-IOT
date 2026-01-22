export class Room {
  constructor(
    public id: string,
    public name: string,
    public volume: number,
    public glazedSurface: number,
    public nbDoors: number,
    public nbExteriorWalls: number,
    public co2Threshold: number,
    public minTempConfort: number,
    public maxTempConfort: number,
    public isExists: boolean
  ) {}
}
