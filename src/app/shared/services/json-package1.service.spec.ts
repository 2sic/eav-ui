import { TestBed, inject } from '@angular/core/testing';

import { JsonPackage1Service } from './json-package1.service';

describe('JsonPackage1Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonPackage1Service]
    });
  });

  it('should be created', inject([JsonPackage1Service], (service: JsonPackage1Service) => {
    expect(service).toBeTruthy();
  }));
});
