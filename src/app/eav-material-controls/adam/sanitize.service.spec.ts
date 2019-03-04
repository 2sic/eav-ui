import { TestBed } from '@angular/core/testing';

import { SanitizeService } from './sanitize.service';

describe('SanitizeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SanitizeService = TestBed.get(SanitizeService);
    expect(service).toBeTruthy();
  });
});
