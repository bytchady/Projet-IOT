import { Component, Input, OnChanges } from '@angular/core';
import {Data} from '../../../models/data';
import {DataService} from '../../../services/data.services';
import {Room} from '../../../models/room';
import {BaseChartDirective} from 'ng2-charts';
import {ChartData, ChartOptions, ChartType} from 'chart.js';

@Component({
  selector: 'app-sensor-graph',
  templateUrl: './sensor-graph.html',
  imports: [BaseChartDirective],
  styleUrls: ['./sensor-graph.scss']
})
export class SensorGraph implements OnChanges {

  @Input() room!: Room;
  @Input() valueKey!: string;
  @Input() color: string = 'rgba(0,0,0,1)';
  @Input() hours: number = 24;

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
    this.dataService.getMeasuresByRoom(this.room, this.hours)
      .subscribe(data => this.processData(data));
  }

  private processData(measures: Data[]) {
    const hourlySum = Array(this.hours).fill(0);
    const hourlyCount = Array(this.hours).fill(0);

    measures.forEach(m => {
      const hour = m.timestamp.getHours();
      const value = (m as any)[this.valueKey];

      if (typeof value === 'number') {
        hourlySum[hour] += value;
        hourlyCount[hour]++;
      }
    });

    const averaged = hourlySum.map((sum, i) =>
      hourlyCount[i] ? sum / hourlyCount[i] : 0
    );

    this.labels = Array.from({ length: this.hours }, (_, i) =>
      `${i.toString().padStart(2, '0')}:00`
    );

    const meta = this.getMeta(this.valueKey);

    this.chartData = {
      labels: this.labels,
      datasets: [
        {
          data: averaged,
          label: meta.label,
          borderColor: this.color,
          backgroundColor: 'transparent',
          tension: 0.3
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: 'Temps (heure)' } },
        y: { title: { display: true, text: meta.unit } }
      }
    };
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
