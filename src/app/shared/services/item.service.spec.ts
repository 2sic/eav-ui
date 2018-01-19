import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ItemService } from './item.service';

import { Item } from '../models/eav';
import { JsonItem1 } from '../models/json-format-v1';

describe('EavItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ItemService]
    });
  });

  it('should be created', inject([ItemService], (service: ItemService) => {
    expect(service).toBeTruthy();
  }));

  /**
   * Test simple entity with only one attribute
   */
  it('should create Item entity with only one attribute - Test 1', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);
        console.log('Item entity with only one attribute :', item);
        expect(item).toBeTruthy();
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



