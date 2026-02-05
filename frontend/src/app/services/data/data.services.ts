import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Data } from '../../models/data';
import { Room } from '../../models/room';
import { AuthServices } from '../auth/auth.services';
import { ServerMessagesServices } from '../server-messages/server-messages.services';

interface ApiResponse<T> {
  message: string;
  error: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DataServices {
  private apiUrl = '/api/data';

  constructor(
    private http: HttpClient,
    private authServices: AuthServices,
    private serverMessageService: ServerMessagesServices
  ) {}

  private getAuthHeaders() {
    const token = this.authServices.getToken();
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Récupère les données d'aujourd'hui (pour room-dashboard)
   */
  getTodayMeasures(roomId: string): Observable<Data[]> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${roomId}/today`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(response => {
        if (response.error || !response.data) {
          return [];
        }
        return response.data.map(item => this.mapToData(item));
      }),
      catchError(err => {
        console.error('Erreur getTodayMeasures:', err);
        return of([]);
      })
    );
  }

  /**
   * Récupère les données par plage de dates (pour rapport)
   */
  getDataByDateRange(roomId: string, startDate: Date, endDate: Date): Observable<Data[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<ApiResponse<any[]>>(
      `${this.apiUrl}/${roomId}/range`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(
      map(response => {
        if (response.error || !response.data) {
          return [];
        }
        return response.data.map(item => this.mapToData(item));
      }),
      catchError(err => {
        console.error('Erreur getDataByDateRange:', err);
        return of([]);
      })
    );
  }

  /**
   * Récupère les données pour plusieurs salles (pour rapport top 3)
   */
  getDataForMultipleRooms(
    roomIds: string[],
    startDate: Date,
    endDate: Date
  ): Observable<Map<string, Data[]>> {
    const params = new HttpParams()
      .set('roomIds', roomIds.join(','))
      .set('startDate', startDate.toISOString().split('T')[0])
      .set('endDate', endDate.toISOString().split('T')[0]);

    return this.http.get<ApiResponse<Record<string, any[]>>>(
      `${this.apiUrl}/rooms`,
      { headers: this.getAuthHeaders(), params }
    ).pipe(
      map(response => {
        if (response.error || !response.data) {
          return new Map();
        }

        const result = new Map<string, Data[]>();
        Object.entries(response.data).forEach(([roomId, items]) => {
          result.set(roomId, items.map(item => this.mapToData(item)));
        });
        return result;
      }),
      catchError(err => {
        console.error('Erreur getDataForMultipleRooms:', err);
        return of(new Map());
      })
    );
  }

  private mapToData(item: any): Data {
    return {
      idData: item.idData,
      timestamp: new Date(item.timestamp),
      valueCO2: item.valueCO2,
      valueTemp: item.valueTemp,
      valueHum: item.valueHum,
      climStatus: item.climStatus,
      idRoom: item.idRoom
    };
  }
}
