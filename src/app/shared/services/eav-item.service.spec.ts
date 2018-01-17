import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { EavItemService } from './eav-item.service';

describe('EavItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [EavItemService]
    });
  });

  it('should be created', inject([EavItemService], (service: EavItemService) => {
    expect(service).toBeTruthy();
  }));
});
