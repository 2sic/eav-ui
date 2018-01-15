import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { JsonContentType1Service } from './json-content-type1.service';

describe('JsonContentType1Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [JsonContentType1Service]
    });
  });

  it('should be created', inject([JsonContentType1Service], (service: JsonContentType1Service) => {
    expect(service).toBeTruthy();
  }));
});
