import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import { Store, StoreModule } from '@ngrx/store';

import 'rxjs/add/operator/map';

import { Item } from '../models/eav';
import { JsonItem1 } from '../models/json-format-v1';
import { AppState } from '../models/app-state';
import { reducers } from '../../shared/store/reducers';
import { ItemService } from './item.service';

import * as test1 from '../../../assets/data/json-to-class-test/item/json-item-v1-test1.json';
import * as test2 from '../../../assets/data/json-to-class-test/item/json-item-v1-test2.json';
import * as test3 from '../../../assets/data/json-to-class-test/item/json-item-v1-test3.json';
import * as test4 from '../../../assets/data/json-to-class-test/item/json-item-v1-test4.json';

describe('ItemService', () => {
  // let service;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule,
        StoreModule.forRoot(reducers)],
      providers: [ItemService, Store]
    });
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  }));

  // beforeEach(inject([ItemService], s => {
  //   service = s;
  //   //jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  // }));

  it('should be created', inject([ItemService], (service: ItemService) => {
    expect(service).toBeTruthy();
  }));

  it('should create Item entity',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test1;

      itemService.getJsonItem1('json-item-v1-test1.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item).toBeTruthy();
      });

      // here we mock return data
      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));


  it('field version should have expected value',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test1;

      itemService.getJsonItem1('json-item-v1-test1.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item.entity.id).toEqual(42900);
        // console.log('jsonItem1', jsonItem1);
        // console.log('item', item);
      });

      // here we mock return data
      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));


  it('field Guid should have expected value',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test1;

      itemService.getJsonItem1('json-item-v1-test1.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item.entity.guid).toEqual('e8a702d2-eccd-4b0f-83bd-600d8a8449d9');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('field type id should have expected value',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test1;

      itemService.getJsonItem1('json-item-v1-test1.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item.entity.type.id).toMatch('TypeId');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('field type name should have expected value',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test1;

      itemService.getJsonItem1('json-item-v1-test1.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item.entity.type.name).toMatch('TypeName');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('field owner should have expected value',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test1;

      itemService.getJsonItem1('json-item-v1-test1.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item.entity.owner).toEqual('dnn:userid=1');
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create Item entity with atributes with diferent types - Test 2',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test2;

      itemService.getJsonItem1('json-item-v1-test2.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test2.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create Item entity with metadata - Test 3',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test3;
      itemService.getJsonItem1('json-item-v1-test3.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test3.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));

  it('should create Item entity Test 4',
    inject([HttpTestingController, ItemService], (httpMock: HttpTestingController, itemService: ItemService) => {
      const mockTest = test4;
      itemService.getJsonItem1('json-item-v1-test4.json').subscribe(jsonItem1 => {
        const item: Item = Item.create(jsonItem1);
        expect(item).toBeTruthy();
      });

      const mockReq = httpMock.expectOne('../../../assets/data/json-to-class-test/item/json-item-v1-test4.json');
      mockReq.flush(mockTest);

      httpMock.verify();
    }));
});
