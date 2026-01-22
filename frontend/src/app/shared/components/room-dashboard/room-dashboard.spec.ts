import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDashboard } from './room-dashboard';

describe('RoomDashboard', () => {
  let component: RoomDashboard;
  let fixture: ComponentFixture<RoomDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
