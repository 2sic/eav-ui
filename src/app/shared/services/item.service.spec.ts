import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemService } from './item.service';

import { Item } from '../models/eav';
import { JsonItem1 } from '../models/json-format-v1';
import { Observable } from 'rxjs/Observable';

describe('EavItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [ItemService]
    });


  });

  it('field version should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);

        expect(item.entity.version).toEqual(429000);
      });
  }));

  it('field Guid should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);

        expect(item.entity.guid).toEqual('e8a702d2-eccd-4b0f-83bd-600d8a8449d9');
      });
  }));

  it('field type id should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);

        expect(item.entity.type.id).toMatch('TypeId');
      });
  }));

  it('field type name should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);
        console.log('TypeName: ', item.entity.type.id);
        expect(item.entity.type.id).toMatch('TypeName');
      });
  }));

  it('field owner should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);

        expect(item.entity.owner).toEqual('dnn:userid=1');
      });
  }));

  it('should create Item entity with atributes with diferent types - Test 2', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test2.json')
      .subscribe(data => {
        const item: Item = Item.create(data);
        console.log('Item entity with atributes with diferent types:', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create Item entity with metadata - Test 3', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test3.json')
      .subscribe(data => {
        const item: Item = Item.create(data);
        console.log('Item entity with metadata: ', item);
        expect(item).toBeTruthy();
      });
  }));

  it('should create Item entity Test 4', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test4.json')
      .subscribe(data => {
        const item: Item = Item.create(data);
        console.log('Create Item entity test 4: ', item);
        expect(item).toBeTruthy();
      });
  }));
});



