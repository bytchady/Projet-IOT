export interface Users {
  idUser: number;
  username: string;
  passwordHash: string;
  email: string | null;
  role: 'admin' | 'user';
  created_at: Date;
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

// =====================
// ROOM TYPES
// =====================
export interface Rooms {
  idRoom: string;
  nameRoom: string;
  ipArduino: string | null;
  volumeRoom: number | null;
  glazedSurface: number | null;
  nbDoors: number | null;
  nbExteriorWalls: number | null;
  minTemp: number | null;
  maxTemp: number | null;
  isExists: boolean;
}

// =====================
// SCHEDULE TYPES
// =====================

// Days of week strict typing
export type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DaySchedule {
  start: string; // ex: "08:00"
  end: string;   // ex: "18:00"
}

// Weekly schedule map type
export type WeeklySchedule = Record<WeekDay, DaySchedule>;

// Room including schedule
export interface RoomWithSchedule extends Rooms {
  schedule: WeeklySchedule;
}

export interface CreateRoomRequest {
  nameRoom: string;
  ipArduino?: string;
  volumeRoom?: number;
  glazedSurface?: number;
  nbDoors?: number;
  nbExteriorWalls?: number;
  minTemp?: number;
  maxTemp?: number;
  schedule?: Partial<WeeklySchedule>;
  isExists: boolean;
}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  idRoom: string;
}

// =====================
// MEASUREMENTS TYPES
// =====================
export interface MeasurementData {
  idData: number;
  timestamp: Date;
  valueCO2: number | null;
  valueTemp: number | null;
  valueHum?: number | null;
  climStatus: boolean | null;
  idRoom: string;
}

export interface ArduinoPublishRequest {
  timestamp: Date;
  valueCO2?: number;
  valueTemp?: number;
  valueHum?: number;
  climStatus?: boolean;
  idRoom: string;
}

// =====================
// ARDUINO CONFIG TYPES
// =====================
export interface ArduinoTempConfig {
  minTemp: number;
  maxTemp: number;
}

export interface ArduinoHoursConfig {
  schedules: {
    day_of_week: WeekDay;
    start_time: string;
    end_time: string;
  }[];
}

// =====================
// JWT PAYLOAD
// =====================
export interface JWTPayload {
  id: number;
  username: string;
  role: string;
}

// =====================
// FASTIFY JWT MODULE AUGMENTATION
// =====================
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}
