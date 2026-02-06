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
    private cdr: ChangeDetectorRef
  ) {}

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
    console.log('🚀 loadData() appelé pour', this.valueKey);
    this.isLoading = true;
    this.noDataMessage = '';

    this.dataService.getTodayMeasures(this.room.idRoom).subscribe({
      next: (measures) => {
        console.log('✅ Réponse API reçue:', measures.length, 'mesures');
        this.processData(measures);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur API:', err);
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

    // Trier les mesures par timestamp
    const sortedMeasures = [...measures].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Extraire les données
    const dataPoints: Array<{ x: number; y: number; timestamp: Date }> = [];

    sortedMeasures.forEach(m => {
      const value = m[this.valueKey];
      if (value === null || value === undefined) return;

      const timestamp = new Date(m.timestamp);
      const hour = timestamp.getUTCHours();
      const minute = timestamp.getUTCMinutes();
      const timeDecimal = hour + minute / 60;

      dataPoints.push({
        x: timeDecimal,
        y: Number(value),
        timestamp: timestamp
      });
    });

    console.log('📊 Points de données:', dataPoints.length);

    this.buildChart(dataPoints);
  }

  private buildChart(dataPoints: Array<{ x: number; y: number; timestamp: Date }>) {
    const meta = this.getMetaLabel(this.valueKey);

    this.chartData = {
      datasets: [
        {
          data: dataPoints.map(p => ({ x: p.x, y: p.y })),
          label: meta.label,
          borderColor: this.color,
          backgroundColor: 'transparent',
          tension: 0.3,
          spanGaps: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
          parsing: false
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'nearest',
          intersect: false,
          callbacks: {
            title: (context) => {
              const index = context[0].dataIndex;
              if (index >= 0 && index < dataPoints.length) {
                const timestamp = dataPoints[index].timestamp;
                return `${timestamp.getUTCHours().toString().padStart(2,'0')}:${timestamp.getUTCMinutes().toString().padStart(2,'0')}`;
              }
              return '';
            },
            label: (context) => {
              const value = context.parsed.y;
              // ✅ Vérification complète pour TypeScript
              if (value === null || value === undefined || typeof value !== 'number') {
                return `${meta.label}: N/A`;
              }
              return `${meta.label}: ${value.toFixed(2)} ${meta.unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          title: {
            display: true,
            text: 'Heure',
            font: { size: 14, weight: 'bold' }
          },
          ticks: {
            stepSize: 1,
            callback: (value) => {
              const hour = Math.floor(Number(value));
              if (hour === 24) return '';
              return `${hour.toString().padStart(2, '0')}:00`;
            },
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          title: {
            display: true,
            text: meta.unit,
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: false,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      }
    };
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
