import { Component, Input, OnChanges } from '@angular/core';
import { Data } from '../../../models/data';
import { DataService } from '../../../services/data.services';
import { Room } from '../../../models/room';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-sensor-graph',
  templateUrl: './sensor-graph.html',
  imports: [BaseChartDirective],
  styleUrls: ['./sensor-graph.scss']
})
export class SensorGraph implements OnChanges {

  @Input() room!: Room;
  @Input() valueKey!: string;          // 'valueTemp' | 'valueCO2' | 'valueHum'
  @Input() color: string = 'rgba(0,0,0,1)';
  @Input() hours: number = 24;

  // Pour filtrer par période : 'day', 'week', 'month', 'year'
  @Input() period: 'day' | 'week' | 'month' | 'year' = 'day';
  @Input() date: Date = new Date();     // Jour ou début de période

  chartData: ChartData<'line'> = { datasets: [] };
  chartOptions: ChartOptions = {};
  chartType: ChartType = 'line';
  labels: string[] = [];

  constructor(private dataService: DataService) {}

  ngOnChanges(): void {
    if (!this.room || !this.valueKey) return;
    this.loadData();
  }

  private loadData() {
    this.dataService.getMeasuresByRoom(this.room, this.hours, this.period, this.date)
      .subscribe(data => this.processData(data));
  }

  private processData(measures: Data[]) {
    // Intervalle entre les points en heures (1 = 1h, 0.5 = 30min)
    const interval = 0.5;
    const now = new Date();
    let startHour = 0;
    let endHour = 23;

// Dashboard salle pour aujourd'hui
    if (this.period === 'day' && this.date.toDateString() === now.toDateString()) {
      const todayKey = this.getDayKey(this.date);
      const sched = this.room.schedule[todayKey];
      if (sched) {
        const [hStart, mStart] = sched.start.split(':').map(Number);
        const [hEnd, mEnd] = sched.end.split(':').map(Number);
        startHour = hStart + mStart / 60;

        // Ne pas dépasser l'heure actuelle
        endHour = Math.min(hEnd + mEnd / 60, now.getHours() + now.getMinutes() / 60);
      }
    } else {
      // Pour les autres jours / périodes : on prend start/end normalement
      const dayKey = this.getDayKey(this.date);
      const sched = this.room.schedule[dayKey];
      if (sched) {
        const [hStart, mStart] = sched.start.split(':').map(Number);
        const [hEnd, mEnd] = sched.end.split(':').map(Number);
        startHour = hStart + mStart / 60;
        endHour = hEnd + mEnd / 60;
      }
    }

    // Génération des intervalles de labels
    const labels: string[] = [];
    for (let t = startHour; t <= endHour; t += interval) {
      const hours = Math.floor(t);
      const minutes = Math.round((t - hours) * 60); // arrondir pour éviter les float
      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      labels.push(`${hStr}:${mStr}`);
    }

    // Agrégation par intervalle
    const summed: number[] = Array(labels.length).fill(0);
    const count: number[] = Array(labels.length).fill(0);

    measures.forEach(m => {
      const value = (m as any)[this.valueKey];
      if (typeof value !== 'number') return;

      const t = m.timestamp.getHours() + m.timestamp.getMinutes() / 60;
      if (t < startHour || t > endHour) return;

      const index = Math.floor((t - startHour) / interval);
      summed[index] += value;
      count[index]++;
    });

    const averaged = summed.map((s, i) => count[i] ? s / count[i] : null);

    this.labels = labels;

    const meta = this.getMeta(this.valueKey);

    this.chartData = {
      labels: this.labels,
      datasets: [
        {
          data: averaged,
          label: meta.label,
          borderColor: this.color,
          backgroundColor: 'transparent',
          tension: 0.3,
          spanGaps: false
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: 'Heure' } },
        y: { title: { display: true, text: meta.unit } }
      }
    };
  }


  private getDayKey(date: Date): keyof Room['schedule'] {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    return days[date.getDay()] as keyof Room['schedule'];
  }

  getMetaLabel(key: string): string {
    const labels: Record<string, string> = {
      valueTemp: 'Température',
      valueCO2: 'CO2',
      valueHum: 'Humidité'
    };
    return labels[key] ?? key;
  }

  private getMeta(key: string) {
    const config: Record<string, { label: string; unit: string }> = {
      valueTemp: { label: 'Température', unit: '°C' },
      valueCO2: { label: 'CO2', unit: 'ppm' },
      valueHum: { label: 'Humidité', unit: '%' }
    };
    return config[key] ?? { label: key, unit: '' };
  }
}
