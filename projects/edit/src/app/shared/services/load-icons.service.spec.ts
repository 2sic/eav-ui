import { TestBed } from '@angular/core/testing';

import { LoadIconsService } from './load-icons.service';

describe('LoadIconsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadIconsService = TestBed.get(LoadIconsService);
    expect(service).toBeTruthy();
  });
});
