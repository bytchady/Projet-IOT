export interface DaySchedule {
  start: string | null;
  end: string | null;
  isClosed: boolean;
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Room {
  idRoom: string;
  nameRoom: string;
  ipArduino: string;
  volumeRoom: number;
  glazedSurface: number;
  nbDoors: number;
  nbExteriorWalls: number;
  minTemp: number;
  maxTemp: number;
  isExists: boolean;
  schedule: Record<WeekDay, DaySchedule>;
}

