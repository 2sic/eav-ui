import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as itemActions from '../shared/actions/item.actions';
import * as contentTypeActions from '../shared/actions/content-type.actions';
import { JsonToModelService } from '../shared/services/json-to-model.service';
import { JsonPackage1, JsonItem1, JsonContentType1, JsonHeader } from '../shared/models';
import { AppState, Item, ContentType, Attribute } from '../shared/models';

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

  constructor(private store: Store<AppState>, private jsonToModelService: JsonToModelService) { }

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
    this.jsonToModelService.getJsonPackage1().subscribe((data: any) => {
      // TODO: Extract to helper
      const attributes: Attribute[] = [];
      const ante = 'test';
      attributes.push(new Attribute('testName', 'testType', true));

      this.jsonPackage1 = new JsonPackage1(
        new JsonHeader(data._.V),
        new ContentType(
          data.ContentType.Id,
          data.ContentType.Name,
          data.ContentType.Scope,
          data.ContentType.Description,
          attributes
        ));
    }, (errors: any) => {
      console.log('errors occured in -> json-to-model.service', errors);
    });
  }

  loadJsonItem1FromJson() {
    this.jsonToModelService.getJsonItem1().subscribe((data: JsonItem1) => {
      this.jsonItem1 = data;
    }, (errors: any) => {
      console.log('errors occured in -> json-to-model.service', errors);
    });
  }

  loadJsonContentType1Json() {
    this.jsonToModelService.getJsonContentType1().subscribe((data: JsonContentType1) => {
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
