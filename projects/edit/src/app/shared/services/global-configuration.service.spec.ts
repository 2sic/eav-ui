import { TestBed } from '@angular/core/testing';

import { GlobalConfigurationService } from './global-configuration.service';

describe('GlobalConfigurationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalConfigurationService = TestBed.get(GlobalConfigurationService);
    expect(service).toBeTruthy();
  });
});
