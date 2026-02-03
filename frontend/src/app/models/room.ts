export interface DaySchedule {
  start: string | null;
  end: string | null;

  isClosed: boolean;
}
export class Room {
  constructor(
    public idRoom: string,
    public nameRoom: string,
    public ipArduino: string,
    public volumeRoom: number,
    public glazedSurface: number,
    public nbDoors: number,
    public nbExteriorWalls: number,
    public minTemp: number,
    public maxTemp: number,
    public isExists: boolean,
    public schedule: {
      monday: DaySchedule;
      tuesday: DaySchedule;
      wednesday: DaySchedule;
      thursday: DaySchedule;
      friday: DaySchedule;
      saturday: DaySchedule;
      sunday: DaySchedule;
    },

  ) { }
}
