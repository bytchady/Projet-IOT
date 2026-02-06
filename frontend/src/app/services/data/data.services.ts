import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Data } from '../../models/data';
import { AuthServices } from '../auth/auth.services';

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
  ) {}

  private getAuthHeaders() {
    const token = this.authServices.getToken();
    return { Authorization: `Bearer ${token}` };
  }

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
