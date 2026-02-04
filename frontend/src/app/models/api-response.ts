export interface ApiResponse<T> {
  message: string;
  error: boolean;
  data: T;
}
