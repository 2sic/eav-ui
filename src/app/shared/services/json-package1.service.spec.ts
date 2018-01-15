import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { JsonPackage1Service } from './json-package1.service';
import { JsonPackage1 } from '../models/json-format-v1';

describe('JsonPackage1Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [JsonPackage1Service]
    });
  });

  it('should be created', inject([JsonPackage1Service, HttpClient], (jsonPackage1Service: JsonPackage1Service) => {
    expect(jsonPackage1Service).toBeTruthy();
  }));

  it('should create json package object test 1', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonPackage1>('../../../assets/data/json-to-class-test/json-format-v1-test1.json')
      .subscribe(data => {
        const createdJsonPackage1: JsonPackage1 = JsonPackage1.create(data);
        console.log('createdJsonPackage1 test1:', createdJsonPackage1);
        expect(createdJsonPackage1).toBeTruthy();
      });
  }));

  it('should create json package object test 2', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonPackage1>('../../../assets/data/json-to-class-test/json-format-v1-test2.json')
      .subscribe(data => {
        const createdJsonPackage1: JsonPackage1 = JsonPackage1.create(data);
        console.log('createdJsonPackage1 test2:', createdJsonPackage1);
        expect(createdJsonPackage1).toBeTruthy();
      });
  }));

  it('should create json package object test 3', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonPackage1>('../../../assets/data/json-format-v1-test3.json')
      .subscribe(data => {
        const createdJsonPackage1: JsonPackage1 = JsonPackage1.create(data);
        console.log('createdJsonPackage1 test3:', createdJsonPackage1);
        expect(createdJsonPackage1).toBeTruthy();
      });
  }));

  it('should create json package object test 4', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonPackage1>('../../../assets/data/json-to-class-test/json-format-v1-test4.json')
      .subscribe(data => {
        const createdJsonPackage1: JsonPackage1 = JsonPackage1.create(data);
        console.log('createdJsonPackage1 test4:', createdJsonPackage1);
        expect(createdJsonPackage1).toBeTruthy();
      });
  }));
});
