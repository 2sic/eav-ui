import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { ContentTypeService } from './content-type.service';
import { JsonContentType1 } from '../models/json-format-v1';
import { ContentType } from '../models/eav';

describe('ContentTypeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ContentTypeService]
    });
  });

  it('should be created', inject([ContentTypeService], (service: ContentTypeService) => {
    expect(service).toBeTruthy();
  }));

  it('should create content type with only one attribute - Test 1', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type with only one attribute test 1:', item);
        expect(item).toBeTruthy();
      });
  }));

  it('field id should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        // console.log('field name: ', item.contentType.id);

        expect(item.contentType.id).toEqual('09ad77bb-66e8-4a1c-92ac-27253afb251d');
      });
  }));

  it('field name should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        // console.log('field name: ', item.contentType.name);

        expect(item.contentType.name).toEqual('Person');
      });
  }));

  it('field scope should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        // console.log('field scope: ', item.contentType.scope);

        expect(item.contentType.scope).toEqual('2SexyContent');
      });
  }));

  it('field description should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test1.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        // console.log('field description: ', item.contentType.description);

        expect(item.contentType.description).toEqual('Person');
      });
  }));

  it('should create content type with many atributes without metadata - Test 2', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test2.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type with atributes with diferent types test 2:', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type with metadata - Test 3', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test3.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type with metadata test 3: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type Test 4', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test4.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type test 4: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type Accordion Test 5', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test5.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type test Accordion 5: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type Blog Test 6', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test6.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type test Blog test 6: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type QR code Test 7', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test7.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type test QR code test 7: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type News-Simpe Test 8', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test8.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type test News-Simpe test 8: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type Tile Test 9', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test9.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type test News-Simpe test 9: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create content type Gallery Test 10', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonContentType1>('../../../assets/data/json-to-class-test/content-type/json-content-type-v1-test10.json')
      .subscribe(data => {
        const item: ContentType = ContentType.create(data);
        console.log('Content type test Gallery test 10: ', item);
        expect(item).toBeTruthy();
      });
  }));

});
