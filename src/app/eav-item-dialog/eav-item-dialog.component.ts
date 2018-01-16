import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import * as itemActions from '../shared/actions/item.actions';
import * as contentTypeActions from '../shared/actions/content-type.actions';
import { JsonPackage1Service } from '../shared/services/json-package1.service';
import { JsonContentType1Service } from '../shared/services/json-content-type1.service';
import { EavEntityService } from '../shared/services/eav-entity.service';
import { AppState, Item } from '../shared/models';
import { EavEntity } from '../shared/models/eav';

@Component({
  selector: 'app-eav-item-dialog',
  templateUrl: './eav-item-dialog.component.html',
  styleUrls: ['./eav-item-dialog.component.css']
})
export class EavItemDialogComponent implements OnInit {
  items$: Observable<Item[]>;

  // Test
  eavEntityTest: EavEntity;

  constructor(private store: Store<AppState>,
    private eavEntityService: EavEntityService) { }

  ngOnInit() {
    // Only for testing Store
    this.loadItems();
    this.items$ = this.store.select(state => state.items);
    this.loadItemsSuccess();

    this.loadJsonItem1FromJson();
  }

  // Testing
  loadJsonItem1FromJson() {
    this.eavEntityService.getEavEntityFromJsonItem1().subscribe((data: EavEntity) => {
      this.eavEntityTest = data;
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
