import { TestBed, inject } from '@angular/core/testing';

import { FileTypeService } from './file-type.service';

describe('FileTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileTypeService]
    });
  });

  it('should be created', inject([FileTypeService], (service: FileTypeService) => {
    expect(service).toBeTruthy();
  }));
});
