import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { EavItemService } from './eav-item.service';

import { EavItem } from '../models/eav';
import { JsonItem1 } from '../models/json-format-v1';

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

  it('should create Eav Item object from json test 1', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/json-entity-v1-test.json')
      .subscribe(data => {
        console.log('createdJsonPackage1', data);
        const createdJsonPackage1: EavItem = EavItem.create(data);
        console.log('createdJsonPackage1', createdJsonPackage1);
        expect(createdJsonPackage1).toBeTruthy();
      });
  }));

  /* it('should create Eav Item object from json test 2', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/json-format-v1-test2.json')
      .subscribe(data => {
        const createdJsonPackage1: EavItem = EavItem.create(data);
        expect(createdJsonPackage1).toBeTruthy();
      });
  })); */

});



