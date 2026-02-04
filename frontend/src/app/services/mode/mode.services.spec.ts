import { TestBed } from '@angular/core/testing';

import { ModeServices } from './mode.services';

describe('ModeServices', () => {
  let service: ModeServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModeServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
