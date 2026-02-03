import { Injectable } from '@angular/core';
import { Room } from '../../models/room';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
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
    if (this.authServices.isLoggedIn()) {
      this.loadRooms();
    }
  }

  /* =======================
     🔐 HEADERS
  ======================= */
  private getAuthHeaders() {
    const token = this.authServices.getToken();
    return {
      headers: new HttpHeaders({Authorization: `Bearer ${token || ''}`})
    };
  }

  /* =======================
     📥 LOAD ALL ROOMS
  ======================= */
  loadRooms() {
    this.http
      .get<{ message: string; error: boolean; data: Room[] }>(
        this.apiUrl,
        this.getAuthHeaders()
      )
      .pipe(
        map(res =>
          res.error
            ? []
            : res.data.sort((a, b) => a.nameRoom.localeCompare(b.nameRoom))
        )
      )
      .subscribe(rooms => {
        this.roomsSubject.next(rooms);
      });
  }

  private defaultSchedule() {
    return {
      monday: {start: '08:00', end: '18:00', isClosed: false},
      tuesday: {start: '08:00', end: '18:00', isClosed: false},
      wednesday: {start: '08:00', end: '18:00', isClosed: false},
      thursday: {start: '08:00', end: '18:00', isClosed: false},
      friday: {start: '08:00', end: '18:00', isClosed: false},
      saturday: {start: null, end: null, isClosed: true},
      sunday: {start: null, end: null, isClosed: true},
    };
  }

  createRoom(room: Partial<Room>) {
    const payload = {
      ...room,
      schedule: room.schedule || this.defaultSchedule()
    };

    return this.http
      .put<{ message: string; error: boolean; data: Room }>(
        this.apiUrl,
        payload,
        this.getAuthHeaders()
      )
      .pipe(
        tap(res => {
          if (!res.error && res.data) {
            const current = this.roomsSubject.getValue();
            this.roomsSubject.next(
              [...current, res.data].sort((a, b) =>
                a.nameRoom.localeCompare(b.nameRoom)
              )
            );
          }
        })
      );
  }

  /* =======================
     🗑 DELETE ROOM
  ======================= */
  deleteRoom(id: string) {
    return this.http
      .request<{ message: string; error: boolean }>('delete', this.apiUrl, {
        ...this.getAuthHeaders(),
        body: {idRoom: id}
      })
      .pipe(
        tap(res => {
          if (!res.error) {
            const filtered = this.roomsSubject
              .getValue()
              .filter(r => r.idRoom !== id);
            this.roomsSubject.next(filtered);
          }
        })
      );
  }

  /* =======================
     ✏️ UPDATE ROOM
  ======================= */
  updateRoom(room: Partial<Room> & { idRoom: string }) {
    return this.http.patch<{ message: string; error: boolean; data: Room }>(
      this.apiUrl,
      room,
      this.getAuthHeaders()
    );
  }

  /* =======================
     🔍 GET ROOM BY ID (CACHE + API)
  ======================= */

  // rooms.service.ts
  getRoomById(id: string): Observable<{ message: string; error: boolean; data?: Room }> {
    const cached = this.roomsSubject
      .getValue()
      .find(r => r.idRoom === id);

    if (cached) {
      return of({message: 'Salle récupérée depuis le cache', error: false, data: cached});
    }

    return this.http
      .get<{ message: string; error: boolean; data: Room }>(
        `${this.apiUrl}/${id}`,
        this.getAuthHeaders()
      )
      .pipe(
        tap(res => {
          if (!res.error && res.data) {
            this.roomsSubject.next([...this.roomsSubject.getValue(), res.data]);
          }
        })
      );
  }
}
