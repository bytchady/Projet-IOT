// User types
export interface User {
  id_user: number;
  username: string;
  password_hash: string;
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

// Room types
export interface Room {
  id_room: string;
  name_room: string;
  ip_arduino: string | null;
  volume_room: number | null;
  glazed_surface: number | null;
  nb_doors: number | null;
  nb_exterior_walls: number | null;
  co2_threshold: number | null;
  min_temp: number | null;
  max_temp: number | null;
  min_hum: number | null;
  max_hum: number | null;
  is_exists: boolean;
}

export interface CreateRoomRequest {
  name_room: string;
  ip_arduino?: string;
  volume_room?: number;
  glazed_surface?: number;
  nb_doors?: number;
  nb_exterior_walls?: number;
  co2_threshold?: number;
  min_temp?: number;
  max_temp?: number;
  min_hum?: number;
  max_hum?: number;
}

export interface UpdateRoomRequest extends Partial<CreateRoomRequest> {
  id_room: string;
}

// Measurement dataset types
export interface MeasurementData {
  id_data: number;
  timestamp: Date;
  value_co2: number | null;
  value_temp: number | null;
  value_hum: number | null;
  clim_status: boolean | null;
  id_room: string;
}

export interface ArduinoPublishRequest {
  id_room: string;
  value_co2?: number;
  value_temp?: number;
  value_hum?: number;
  clim_status?: boolean;
}

// Schedule types
export interface RoomSchedule {
  id_horaire: number;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string | null;
  end_time: string | null;
  id_room: string;
}

// Arduino config types
export interface ArduinoTempConfig {
  min_temp: number;
  max_temp: number;
}

export interface ArduinoHoursConfig {
  schedules: {
    day_of_week: string;
    start_time: string;
    end_time: string;
  }[];
}

// JWT payload
export interface JWTPayload {
  id: number;
  username: string;
  role: string;
}

// Fastify JWT module augmentation
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JWTPayload;
    user: JWTPayload;
  }
}
