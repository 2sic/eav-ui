import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ItemService } from './item.service';
import 'rxjs/add/operator/map';

import { Item } from '../models/eav';
import { JsonItem1 } from '../models/json-format-v1';
import { Observable } from 'rxjs/Observable';

// describe('FancyService without the TestBed', inject([HttpClient], (httpClient: HttpClient) => {
//   let service: ItemService;

//   beforeEach(async(() => { service = new ItemService(httpClient); }));

//   it('#getObservableValue should return observable value', async(() => (done: DoneFn) => {
//     service.getItemFromJsonItem1().subscribe(value => {
//       expect(value.entity.guid).toEqual('e8a702d2-eccd-4b0f-83bd-600d8a8449d9');
//       done();
//     });
//   }));

// }));

// describe('RaceService', () => {
//   let service: ItemService;
//   // beforeEachProviders(() => [HttpClient]);

//   // beforeEach(inject([HttpClient], httpClient => service = new ItemService(httpClient)));


//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [HttpClientModule, HttpClientTestingModule],
//       providers: [
//         HttpClient
//       ]
//     });
//   });

//   beforeEach(inject([HttpClient], (httpClient: HttpClient) => {
//     this.service = new ItemService(httpClient);
//   }));

//   // it('#getValue should return real value', () => {
//   //   expect(true).toEqual(false);
//   // });
//   // async test and service already injected, no need to wrap with inject
//   it('should return a promise of 2 races', (done: DoneFn) => {
//     this.service.getItemFromJsonItem1().subscribe(value => {
//       // expect(value.entity.guid).toEqual('e8a702d2-eccd-4b0f-83bd-600d8a8449d9');
//       expect(true).toEqual(false);
//       done();
//     });


//   });
// });



describe('EavItemService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [ItemService]
    });
  });

  // it('#getValue should return real value', inject([HttpClient], (httpClient: HttpClient, done: DoneFn) => {
  //   const service: ItemService = new ItemService(httpClient);
  //   const asd = '';
  //   service.getItemFromJsonItem1().subscribe(item => {
  //     // expect(item.entity.guid).toEqual('e8a702d2-eccd-4b0f-83bd-600d8a8449d9');
  //     this.asd = 'true'; // expect(true).toEqual(false);
  //     done();
  //   });
  //   expect(this.asd).toEqual('true');
  // }));

  it('field version should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);

        // expect(item.entity.version).toEqual(429000);
        expect(true).toEqual(false);
      });
  }));

  it('field version should have expected value', inject([HttpClient], (httpClient: HttpClient) => {
    httpClient.get<JsonItem1>('../../../assets/data/json-to-class-test/item/json-item-v1-test1.json')
      .subscribe(data => {
        const item: Item = Item.create(data);

        // expect(item.entity.version).toEqual(429000);
        expect(true).toEqual(false);

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



