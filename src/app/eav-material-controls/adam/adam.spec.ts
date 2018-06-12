import { TestBed, inject } from '@angular/core/testing';

import { AdamService } from './adam-service.service';

describe('AdamServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdamService]
    });
  });

  it('should be created', inject([AdamService], (service: AdamService) => {
    expect(service).toBeTruthy();
  }));
});
