import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerMessage } from './server-message';

describe('ServerMessage', () => {
  let component: ServerMessage;
  let fixture: ComponentFixture<ServerMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
