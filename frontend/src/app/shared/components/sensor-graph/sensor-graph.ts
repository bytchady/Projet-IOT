import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Measure} from '../../../models/measure';
import {MeasuresService} from '../../../services/measures.services';
import {Sensor} from '../../../models/sensor';
import {BaseChartDirective} from 'ng2-charts';
import {ChartData, ChartOptions, ChartType} from 'chart.js';

@Component({
  selector: 'app-sensor-graph',
  templateUrl: './sensor-graph.html',
  imports: [
    BaseChartDirective
  ],
  styleUrls: ['./sensor-graph.scss']
})
export class SensorGraph implements OnChanges {

  @Input() sensor!: Sensor;
  @Input() color: string = 'rgba(0,0,0,1)';
  @Input() hours: number = 24;

  chartData: ChartData<'line'> = { datasets: [] };
  chartOptions: ChartOptions = {};
  chartType: ChartType = 'line';
  labels: string[] = [];

  constructor(private measuresService: MeasuresService) {}

  ngOnChanges(): void {
    if (!this.sensor) return;

    this.loadData();
  }

  private loadData() {
    this.measuresService.getMeasuresBySensor(this.sensor, this.hours)
      .subscribe(ms => this.processData(ms));
  }

  private processData(measures: Measure[]) {
    const hourly = Array(this.hours).fill(0);
    const count = Array(this.hours).fill(0);

    measures.forEach(m => {
      const hour = m.timestamp.getHours();
      hourly[hour] += m.value;
      count[hour]++;
    });

    const averaged = hourly.map((v, i) => count[i] ? v / count[i] : 0);

    this.labels = Array.from({ length: this.hours }, (_, i) => `${i}:00`);

    this.chartData = {
      labels: this.labels,
      datasets: [
        {
          data: averaged,
          label: this.sensor.type.name,
          borderColor: this.color,
          backgroundColor: 'transparent',
          tension: 0.3
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      plugins: { legend: { display: true } }
    };
  }
}
