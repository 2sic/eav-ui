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

});


