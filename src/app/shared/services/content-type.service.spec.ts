import { TestBed, inject } from '@angular/core/testing';

import { ContentTypeService } from './content-type.service';

describe('ContentTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentTypeService]
    });
  });

  it('should be created', inject([ContentTypeService], (service: ContentTypeService) => {
    expect(service).toBeTruthy();
  }));
});
