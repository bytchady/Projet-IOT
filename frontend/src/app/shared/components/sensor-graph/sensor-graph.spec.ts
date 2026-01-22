import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorGraph } from './sensor-graph';

describe('SensorGraph', () => {
  let component: SensorGraph;
  let fixture: ComponentFixture<SensorGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorGraph]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
