import { Component, OnInit, Input } from '@angular/core';
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
export class SensorGraph implements OnInit {
  @Input() sensor!: Sensor;
  @Input() color: string = 'rgba(0,0,0,1)';
  @Input() hours: number = 24;

  lineGraphData: ChartData<'line', number[], string> = { labels: [], datasets: [] };
  lineGraphOptions: ChartOptions = {};
  lineGraphType: ChartType = 'line';

  constructor(private measuresService: MeasuresService) {}

  ngOnInit(): void {
    if (!this.sensor) return;

    this.measuresService.getMeasuresBySensor(this.sensor, this.hours)
      .subscribe((ms: Measure[]) => this.processData(ms));
  }

  private processData(measures: Measure[]) {
    const hourlyData: number[] = Array(this.hours).fill(0);
    const counts: number[] = Array(this.hours).fill(0);

    measures.forEach(m => {
      const hour = m.timestamp.getHours();
      hourlyData[hour] += m.value;
      counts[hour] += 1;
    });

    const avgData = hourlyData.map((v, i) => counts[i] ? parseFloat((v / counts[i]).toFixed(2)) : 0);

    this.lineGraphData = {
      labels: Array.from({ length: this.hours }, (_, i) => `${i}:00`),
      datasets: [{
        data: avgData,
        label: this.sensor.type.name,
        borderColor: this.color,
        backgroundColor: 'transparent',
        fill: false
      }]
    };

    this.lineGraphOptions = {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: { title: { display: true, text: 'Hour' } },
        y: { title: { display: true, text: 'Value' } }
      }
    };
  }
}
