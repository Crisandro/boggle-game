import { TestBed } from '@angular/core/testing';

import { BoggleService } from './boggle.service';

describe('BoggleService', () => {
  let service: BoggleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoggleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
