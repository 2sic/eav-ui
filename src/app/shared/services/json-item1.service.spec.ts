import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { JsonItem1Service } from './json-item1.service';

describe('JsonItem1Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [JsonItem1Service]
    });
  });

  it('should be created', inject([JsonItem1Service], (service: JsonItem1Service) => {
    expect(service).toBeTruthy();
  }));
});
