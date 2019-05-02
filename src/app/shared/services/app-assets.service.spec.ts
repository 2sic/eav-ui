import { TestBed } from '@angular/core/testing';

import { AppAssetsService } from './app-assets.service';

describe('AppAssetsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppAssetsService = TestBed.get(AppAssetsService);
    expect(service).toBeTruthy();
  });
});
