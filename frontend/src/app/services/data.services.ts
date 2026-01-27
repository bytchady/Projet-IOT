import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Room } from '../models/room';
import { Data } from '../models/data';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  /**
   * Retourne les mesures d'une salle selon le nombre d'heures et le type de période
   * @param room La salle
   * @param hours Nombre d'heures à simuler (pour test)
   * @param period day | week | month | year
   * @param date Jour de référence pour récupérer les données
   */
  getMeasuresByRoom(
    room: Room,
    hours: number = 24,
    period: 'day' | 'week' | 'month' | 'year' = 'day',
    date: Date = new Date()
  ): Observable<Data[]> {

    // TODO: remplacer cette partie par l'appel backend
    // Exemple API: GET /api/room/:id/data/:period?date=YYYY-MM-DD
    // const params = new HttpParams().set('date', date.toISOString());
    // return this.http.get<Data[]>(`/api/room/${room.idRoom}/data/${period}`, { params });

    // === SIMULATION POUR TEST ===
    const data: Data[] = [];
    const start = new Date(date);
    start.setHours(0, 0, 0, 0); // début de la journée
    let id = 1;

    // Intervalle 1 minute par défaut
    const intervalMinutes = 1;

    for (let h = 0; h < hours; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        const timestamp = new Date(start.getTime() + h * 3600000 + m * 60000);

        const valueTemp = 20 + Math.random() * 5;    // 20–25°C
        const valueCO2 = 400 + Math.random() * 800;  // 400–1200 ppm
        const valueHum = 30 + Math.random() * 30;    // 30–60%
        const climStatus = Math.random() > 0.5;      // true/false aléatoire

        data.push(new Data(
          id++,
          timestamp,
          parseFloat(valueCO2.toFixed(2)),
          parseFloat(valueTemp.toFixed(2)),
          parseFloat(valueHum.toFixed(2)),
          climStatus,
          room
        ));
      }
    }

    return of(data);
  }
}
