import { TestBed } from '@angular/core/testing';

import { RoomsServices } from './rooms.services';

describe('RoomsServices', () => {
  let service: RoomsServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomsServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
