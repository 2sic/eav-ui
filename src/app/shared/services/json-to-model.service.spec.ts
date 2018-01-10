import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { JsonToModelService } from './json-to-model.service';

describe('JsonToModelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [JsonToModelService]
    });
  });

  it('should be created', inject([JsonToModelService], (service: JsonToModelService) => {
    expect(service).toBeTruthy();
  }));
});
