import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import * as itemActions from '../shared/actions/item.actions';
import * as contentTypeActions from '../shared/actions/content-type.actions';
import { JsonPackage1Service } from '../shared/services/json-package1.service';
import { JsonContentType1Service } from '../shared/services/json-content-type1.service';
import { JsonItem1Service } from '../shared/services/json-item1.service';
import { AppState, Item } from '../shared/models';
import { JsonPackage1, JsonContentType1, JsonItem1, ContentType1, Attribute1, JsonHeader1 } from '../shared/models/json-format-v1';

@Component({
  selector: 'app-eav-item-dialog',
  templateUrl: './eav-item-dialog.component.html',
  styleUrls: ['./eav-item-dialog.component.css']
})
export class EavItemDialogComponent implements OnInit {
  items$: Observable<Item[]>;
  jsonPackage1: JsonPackage1;
  jsonItem1: JsonItem1;
  jsonContentType1: JsonContentType1;

  constructor(private store: Store<AppState>,
    private jsonPackage1Service: JsonPackage1Service,
    private jsonItem1Service: JsonItem1Service,
    private jsonContentType1Service: JsonContentType1Service) { }

  ngOnInit() {
    // Only for testing Store
    this.loadItems();
    this.items$ = this.store.select(state => state.items);
    this.loadItemsSuccess();

    // Testing loading json to in-memory class
    this.loadJsonPackage1FromJson();
    this.loadJsonItem1FromJson();
    this.loadJsonContentType1Json();
  }

  loadJsonPackage1FromJson() {
    this.jsonPackage1Service.getJsonPackage1().map(data => {
      console.log('getJsonPackage1:', data);
      this.jsonPackage1 = data;
    }).subscribe();
  }

  loadJsonItem1FromJson() {
    this.jsonItem1Service.getJsonItem1().subscribe((data: JsonItem1) => {
      this.jsonItem1 = data;
    }, (errors: any) => {
      console.log('errors occured in -> json-to-model.service', errors);
    });
  }

  loadJsonContentType1Json() {
    this.jsonContentType1Service.getJsonContentType1().subscribe((data: JsonContentType1) => {
      this.jsonContentType1 = data;
    }, (errors: any) => {
      console.log('errors occured in -> json-to-model.service', errors);
    });
  }

  loadItems() {
    this.store.dispatch(new itemActions.LoadItemsAction());
  }

  loadItemsSuccess() {
    this.store.dispatch(new itemActions.LoadItemsSuccessAction([{ id: 100, name: 'Items success' }]));
  }
}
