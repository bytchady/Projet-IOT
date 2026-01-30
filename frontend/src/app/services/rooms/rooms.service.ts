import { Injectable } from '@angular/core';
import { Room } from '../../models/room';
import {BehaviorSubject, Observable, of, tap} from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthServices } from '../auth/auth.services';

@Injectable({
  providedIn: 'root'
})
export class RoomsServices {
  private apiUrl = 'http://localhost:3000/api/rooms';

  private roomsSubject = new BehaviorSubject<Room[]>([]);
  rooms$ = this.roomsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authServices: AuthServices
  ) {
    // ⚡ Charger automatiquement les salles si l'utilisateur est connecté au démarrage
    if (this.authServices.isLoggedIn()) {
      this.loadRooms();
    }
  }

  loadRooms() {
    const { headers } = this.getAuthHeaders();
    this.http.get<{ message: string; error: boolean; data: Room[] }>(this.apiUrl, { headers })
      .subscribe(res => {
        if (!res.error) {
          this.roomsSubject.next(res.data);
        }
      });
  }

  private getAuthHeaders() {
    const token = this.authServices.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token || ''}`
      })
    };
  }

  createRoom(room: Partial<Room>) {
    const payload = {
      ...room,
      isExists: true,
      schedule: room.schedule || this.defaultSchedule()
    };
    return this.http.put<{ message: string; error: boolean; data: Room }>(this.apiUrl, payload, this.getAuthHeaders())
      .pipe(
        tap(res => {
          if (!res.error && res.data) {
            const current = this.roomsSubject.getValue();
            this.roomsSubject.next([...current, res.data]);
          }
        })
      );
  }

  private defaultSchedule() {
    return {
      monday: { start: '08:00', end: '18:00' },
      tuesday: { start: '08:00', end: '18:00' },
      wednesday: { start: '08:00', end: '18:00' },
      thursday: { start: '08:00', end: '18:00' },
      friday: { start: '08:00', end: '18:00' },
      saturday: { start: '08:00', end: '18:00' },
      sunday: { start: '08:00', end: '18:00' },
    };
  }

  updateRoom(room: Partial<Room> & { idRoom: string }): Observable<{ message: string; error: boolean; data: Room }> {
    return this.http.patch<{ message: string; error: boolean; data: Room }>(
      this.apiUrl,
      room,
      this.getAuthHeaders()
    );
  }

  deleteRoom(id: string): Observable<{ message: string; error: boolean }> {
    return this.http.request<{ message: string; error: boolean }>('delete', this.apiUrl, {
      ...this.getAuthHeaders(),
      body: { idRoom: id }
    });
  }

  getRoomById(id: string): Observable<{ message: string; error: boolean; data: Room }> {
    return this.http.get<{ message: string; error: boolean; data: Room }>(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    );
  }
}
