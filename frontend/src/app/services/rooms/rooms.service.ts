import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Room } from '../../models/room';
import { ServerMessagesServices } from '../server-messages/server-messages.services';
import { ApiResponse } from '../../models/api-response';
import { AuthServices } from '../auth/auth.services';

@Injectable({ providedIn: 'root' })
export class RoomsServices {
  private apiUrl = '/api/rooms';
  private rooms = new BehaviorSubject<Room[]>([]);

  constructor(
    private http: HttpClient,
    private serverMessageService: ServerMessagesServices,
    private authServices: AuthServices
  ) {}

  private getAuthHeaders() {
    const token = this.authServices.getToken();
    return { Authorization: `Bearer ${token}` };
  }

  getRooms(): Observable<Room[]> {
    return this.http.get<ApiResponse<Room[]>>(this.apiUrl, {headers: this.getAuthHeaders()})
      .pipe(
        map(res => res.data),
        catchError(err => {
          this.serverMessageService.showMessage(err.error?.message || 'Erreur lors du chargement des salles', true);
          throw err;
        }
      )
    );
  }

  getRoomById(id: string): Observable<Room | null> {
    return this.http.get<ApiResponse<Room>>(`${this.apiUrl}/${id}`, {headers: this.getAuthHeaders()})
      .pipe(
        map(res => res.data || null),
        tap(res => {
          if (res) {
            const current = this.rooms.getValue();
            const index = current.findIndex(r => r.idRoom === res.idRoom);
            if (index === -1) {
              this.rooms.next([res, ...current]);
            }
          }
        }),
        catchError(err => {
          this.serverMessageService.showMessage(err.error?.message || 'Erreur serveur', true);
          throw err;
        }
      )
    );
  }

  createRoom(room: Partial<Room>): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(this.apiUrl, room, {headers: this.getAuthHeaders()})
      .pipe(
        tap(res => {this.serverMessageService.showMessage(res.message, res.error);
        }),
        catchError(err => {
          this.serverMessageService.showMessage(err.error?.message || 'Erreur serveur', true);
          throw err;
        }
      )
    );
  }

  updateRoom(room: Room): Observable<Room> {
    return this.http.put<ApiResponse<Room>>(`${this.apiUrl}/${room.idRoom}`, room, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(res => {
        this.serverMessageService.showMessage(res.message, res.error);
        return res.data;
      }),
      tap(updatedRoom => {
        const current = this.rooms.getValue();
        const index = current.findIndex(r => r.idRoom === updatedRoom.idRoom);
        if (index !== -1) current[index] = updatedRoom;
        this.rooms.next([...current]);
      }),
      catchError(err => {
        this.serverMessageService.showMessage(
          err.error?.message || 'Erreur lors de la mise à jour',
          true
        );
        throw err;
      })
    );
  }

  deleteRoom(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers: this.getAuthHeaders()})
      .pipe(
        tap(() => {
          const current = this.rooms.getValue();
          this.rooms.next(current.filter(r => r.idRoom !== id));
        }),
        catchError(err => {
          this.serverMessageService.showMessage(err.error?.message || 'Erreur lors de la suppression', true);
          throw err;
        }
      )
    );
  }
}
