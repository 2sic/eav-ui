import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';

import { ContentTypeService } from './content-type.service';
import { ContentType } from '../models/eav';
import { reducers } from '../../shared/store/reducers';

import * as contentTypeTest1 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json';
import * as contentTypeTest2 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test2.json';
import * as contentTypeTest3 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test3.json';
import * as contentTypeTest4 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test4.json';
import * as contentTypeTest5 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test5.json';
import * as contentTypeTest6 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test6.json';
import * as contentTypeTest7 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test7.json';
import * as contentTypeTest8 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test8.json';
import * as contentTypeTest9 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test9.json';
import * as contentTypeTest10 from '../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test10.json';


describe('ContentTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule,
        HttpClientTestingModule,
        StoreModule.forRoot(reducers)],
      providers: [ContentTypeService, Store]
    });
  });

  it('should be created', inject([ContentTypeService], (service: ContentTypeService) => {
    expect(service).toBeTruthy();
  }));

  it('should create content type with only one attribute - Test 1',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest1;
      contentTypeService.getJsonContentType1('json-content-type-v1-test1.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      // here we mock return data
      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('field id should have expected value',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest1;

      contentTypeService.getJsonContentType1('json-content-type-v1-test1.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType.contentType.id).toEqual('ab6abad9-a10e-49c3-aae4-9bfa45d9ee80');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('field name should have expected value',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest1;

      contentTypeService.getJsonContentType1('json-content-type-v1-test1.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType.contentType.name).toEqual('Second');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('field scope should have expected value',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest1;

      contentTypeService.getJsonContentType1('json-content-type-v1-test1.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType.contentType.scope).toEqual('2SexyContent');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('field description should have expected value',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest1;

      contentTypeService.getJsonContentType1('json-content-type-v1-test1.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType.contentType.description).toEqual('Test');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type with many atributes without metadata - Test 2',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest2;

      contentTypeService.getJsonContentType1('json-content-type-v1-test2.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test2.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type with metadata - Test 3',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest3;

      contentTypeService.getJsonContentType1('json-content-type-v1-test3.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test3.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type - Test 4',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest4;

      contentTypeService.getJsonContentType1('json-content-type-v1-test4.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test4.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type Accordion Test 5',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest5;

      contentTypeService.getJsonContentType1('json-content-type-v1-test5.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test5.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type Blog Test 6',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest6;

      contentTypeService.getJsonContentType1('json-content-type-v1-test6.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test6.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type QR code Test 7',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest7;

      contentTypeService.getJsonContentType1('json-content-type-v1-test7.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test7.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type News-Simpe Test 8',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest8;

      contentTypeService.getJsonContentType1('json-content-type-v1-test8.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test8.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type Tile Test 9',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest9;

      contentTypeService.getJsonContentType1('json-content-type-v1-test9.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test9.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create content type Gallery Test 10',
    inject([HttpTestingController, ContentTypeService], (httpMock: HttpTestingController, contentTypeService: ContentTypeService) => {
      const mockTest = contentTypeTest10;

      contentTypeService.getJsonContentType1('json-content-type-v1-test10.json').subscribe(jsonContentType1 => {
        const contentType: ContentType = ContentType.create(jsonContentType1);
        expect(contentType).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test10.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));
});
