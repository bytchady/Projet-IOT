import { TestBed } from '@angular/core/testing';

import { ServerMessagesServices } from './server-messages.services';

describe('ServerMessagesServices', () => {
  let service: ServerMessagesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerMessagesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
