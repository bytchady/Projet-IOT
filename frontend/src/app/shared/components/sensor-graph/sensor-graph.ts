import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Data } from '../../../models/data';
import { DataServices } from '../../../services/data/data.services';
import { Room } from '../../../models/room';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-sensor-graph',
  templateUrl: './sensor-graph.html',
  standalone: true,
  imports: [BaseChartDirective],
  styleUrls: ['./sensor-graph.scss']
})
export class SensorGraph implements OnChanges {

  @Input() room!: Room;
  @Input() valueKey!: 'valueTemp' | 'valueCO2' | 'valueHum';
  @Input() color: string = 'rgba(0,0,0,1)';

  chartData: ChartData<'line'> = { datasets: [] };
  chartOptions: ChartOptions = {};
  chartType: ChartType = 'line';
  isLoading: boolean = false;
  noDataMessage: string = '';

  constructor(
    private dataService: DataServices,
    private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.room || !this.valueKey) return;

    if (changes['room'] || changes['valueKey']) {
      this.loadData();
    }
  }

  refresh(): void {
    this.loadData();
  }

  private loadData() {
    this.isLoading = true;
    this.noDataMessage = '';

    const today = new Date();
    const dayKey = this.getDayKey(today);
    const schedule = this.room.schedule[dayKey];

    this.dataService.getTodayMeasures(this.room.idRoom).subscribe({
      next: (measures) => {
        this.processData(measures);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.noDataMessage = 'Erreur lors du chargement des données';
        this.cdr.detectChanges();
      }
    });
  }

  private processData(measures: Data[]) {
    if (!measures || measures.length === 0) {
      this.noDataMessage = 'Aucune donnée disponible pour aujourd\'hui';
      this.chartData = { datasets: [] };
      return;
    }

    const chartLabels: string[] = [];
    const chartValues: (number | null)[] = [];

    measures.forEach(m => {
      const value = m[this.valueKey];
      if (value === null || value === undefined) return;

      const timestamp = new Date(m.timestamp);
      const hours = timestamp.getUTCHours();    // <-- UTC
      const minutes = timestamp.getUTCMinutes(); // <-- UTC

      const label = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`;
      chartLabels.push(label);
      chartValues.push(Number(value));
    });

    const displayLabels: string[] = [];
    for (let h = 0; h <= 23; h++) {
      displayLabels.push(`${h.toString().padStart(2,'0')}:00`);
    }

    this.buildChart(chartLabels, chartValues, displayLabels);
  }

  private buildChart(chartLabels: string[], chartValues: (number | null)[], displayLabels: string[]) {
    const meta = this.getMetaLabel(this.valueKey);

    this.chartData = {
      labels: chartLabels,
      datasets: [
        {
          data: chartValues,
          label: meta.label,
          borderColor: this.color,
          backgroundColor: 'transparent',
          tension: 0.3,
          spanGaps: true,
          pointRadius: 2,
          pointHoverRadius: 4,
          borderWidth: 2
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y;
              return `${label}: ${value !== null ? value.toFixed(2) : 'N/A'} ${meta.unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Heure', font: { size: 14, weight: 'bold' } },
          ticks: {
            autoSkip: false,
            maxRotation: 0,
            minRotation: 0,
            callback: (value, index) => {
              const label = this.chartData.labels![index] as string;
              // Afficher uniquement les heures complètes
              return label.endsWith('00') ? label : '';
            }
          },
          grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' }
        },
        y: {
          title: { display: true, text: meta.unit, font: { size: 14, weight: 'bold' } },
          beginAtZero: false,
          grid: { display: true, color: 'rgba(0, 0, 0, 0.05)' }
        }
      },
      interaction: { mode: 'index', intersect: false }
    };
  }

  private getDayKey(date: Date): keyof Room['schedule'] {
    const days: (keyof Room['schedule'])[] = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ];
    return days[date.getDay()];
  }

  getMetaLabel(key: string) {
    const config: Record<string, { label: string; unit: string }> = {
      valueTemp: { label: 'Température', unit: '°C' },
      valueCO2: { label: 'CO2', unit: 'ppm' },
      valueHum: { label: 'Humidité', unit: '%' }
    };
    return config[key] ?? { label: key, unit: '' };
  }
}
