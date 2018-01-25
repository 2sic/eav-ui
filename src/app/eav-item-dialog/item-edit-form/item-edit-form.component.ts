import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
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
  form = new FormGroup({});
  itemFields$: Observable<FormlyFieldConfig[]>;
  // itemFieldss$: FormlyFieldConfig[] = [{ // TODO: our Fields are contentTypes attributes
  //   key: 'FullName.values[0].value',
  //   type: 'input',
  //   templateOptions: {
  //     type: 'text',
  //     label: 'FullName',
  //     placeholder: 'Enter FullName',
  //     required: true,
  //   }
  // },
  // {
  //   key: 'Position.values[0].value',
  //   type: 'input',
  //   templateOptions: {
  //     type: 'text',
  //     label: 'Description',
  //     placeholder: 'Enter description',
  //     required: true,
  //   }
  // },
  // {
  //   key: 'Description.values[0].value',
  //   type: 'input',
  //   templateOptions: {
  //     type: 'text',
  //     label: 'Description',
  //     placeholder: 'Enter description',
  //     required: true,
  //   }
  // },
  // {
  //   key: 'Email.values[0].value',
  //   type: 'input',
  //   templateOptions: {
  //     type: 'text',
  //     label: 'Description',
  //     placeholder: 'Enter description',
  //     required: true,
  //   }
  // }
  // ];



  constructor(private store: Store<AppState>) { }

  // Test
  submit(attributes) {
    console.log(attributes);
  }

  ngOnInit() {
    this.loadContentType();
  }

  loadContentType() {
    // Load content type for item$ from store
    // this.contentTypes$ = this.store.select(state => state.contentTypes);

    // TODO: place item$.entity.type.id
    // this.contentType$ = this.fetchById('09ad77bb-66e8-4a1c-92ac-27253afb251d'); // person
    this.contentType$ = this.fetchById('884e65b4-8f1c-4bc9-897f-147dcabeb941'); // accordion
    // map content type attributes to itemFields (formlyFieldConfigArray)
    this.itemFields$ = this.mapContentTypeFields();
  }

  // TEST - Load content type for item$ from store
  fetchById(id: string): Observable<ContentType> {
    return this.store
      .select(s => s.contentTypes)
      .map(data => data.find(obj => obj.contentType.id === id));
  }

  /**
   * map content type attributes to itemFields (formlyFieldConfigArray)
   */
  mapContentTypeFields(): Observable<FormlyFieldConfig[]> {
    return this.contentType$
      .switchMap((data) => {
        const formlyFieldConfigArray: FormlyFieldConfig[] = [];
        // loop through contentType attributes
        data.contentType.attributes.forEach(attribute => {
          const formlyFieldConfig: FormlyFieldConfig = this.getFormlyFieldFromAttributeDef(attribute);

          formlyFieldConfigArray.push(formlyFieldConfig);
        });

        return [formlyFieldConfigArray];
      });
  }

  /**
   * Get FormlyField from AttributeDef
   * @param attribute
   */
  getFormlyFieldFromAttributeDef(attribute: AttributeDef): FormlyFieldConfig {
    return {
      key: `${attribute.name}.values[0].value`,
      type: 'input',
      // wrappers: ['panel'],
      templateOptions: {
        type: 'text',
        label: attribute.name,
        placeholder: `Enter ${attribute.name}`,
        required: true,
      }
    };
  }
}

