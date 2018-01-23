import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/map';

import { AppState } from '../../shared/models';
import { Item, ContentType } from '../../shared/models/eav';
import { AttributeDef } from '../../shared/models/eav/attribute-def';

@Component({
  selector: 'app-item-edit-form',
  templateUrl: './item-edit-form.component.html',
  styleUrls: ['./item-edit-form.component.css']
})
export class ItemEditFormComponent implements OnInit {
  @Input() item$: Observable<Item>;

  // contentTypes$: Observable<ContentType[]>;

  contentType$: Observable<ContentType>;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.loadContentType();
  }

  loadContentType() {
    // TODO: Load content type for item$ from store
    // this.contentTypes$ = this.store.select(state => state.contentTypes);

    this.contentType$ = this.fetchById('|Config ToSic.Eav.DataSources.SqlDataSource');
  }
  // TEST
  fetchById(id: string): Observable<ContentType> {
    return this.store
      .select(s => s.contentTypes)
      .map(list => list.find(obj => obj.contentType.id === id));
  }
}
