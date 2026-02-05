export interface Users {
  idUser: number;
  username: string;
  passwordHash: string;
  email: string | null;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

export interface Rooms {
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
}

export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DaySchedule {
  start: string | null;
  end: string | null;
  isClosed: boolean;
}

export type WeeklySchedule = Record<WeekDay, DaySchedule>;

export interface RoomWithSchedule extends Rooms {
  schedule: WeeklySchedule;
}

export interface CreateRoomRequest {
  nameRoom: string;
  ipArduino: string;
  volumeRoom: number;
  glazedSurface: number;
  nbDoors: number;
  nbExteriorWalls: number;
  minTemp: number;
  maxTemp: number;
  schedule: WeeklySchedule;
  isExists: boolean;
}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {}

export interface MeasurementData {
  idData: number;
  timestamp: Date;
  valueCO2: number | null;
  valueTemp: number | null;
  valueHum: number | null;
  climStatus: boolean | null;
  idRoom: string;
}

export interface ArduinoPublishRequest {
  timestamp?: Date;
  valueCO2?: number;
  valueTemp?: number;
  valueHum?: number;
  climStatus?: boolean;
  idRoom: string;
}

export interface ArduinoTempConfig {
  minTemp: number;
  maxTemp: number;
}

export interface ArduinoHoursConfig {
  schedules: {
    dayOfWeek: WeekDay;
    startTime: string;
    endTime: string;
  }[];
}

export interface JWTPayload {
  id: number;
  username: string;
  role: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}
