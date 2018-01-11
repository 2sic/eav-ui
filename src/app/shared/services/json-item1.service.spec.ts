import { TestBed, inject } from '@angular/core/testing';

import { JsonItem1Service } from './json-item1.service';

describe('JsonItem1Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonItem1Service]
    });
  });

  it('should be created', inject([JsonItem1Service], (service: JsonItem1Service) => {
    expect(service).toBeTruthy();
  }));
});
