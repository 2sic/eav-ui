import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { EavEntityService } from './eav-entity.service';

describe('EavEntityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [EavEntityService]
    });
  });

  it('should be created', inject([EavEntityService], (service: EavEntityService) => {
    expect(service).toBeTruthy();
  }));
});
