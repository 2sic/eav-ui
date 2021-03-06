import { FormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../eav-dynamic-form/model/field-config';
import { QueryEntity } from '../input-types/entity/entity-query/entity-query.models';

export interface PagePickerDialogData {
  config: FieldConfigSet;
  group: FormGroup;
}

export interface PageEntity extends QueryEntity {
  Created: string;
  Guid: string;
  Id: number;
  Modified: string;
  Name: string;
  ParentId: number;
  Path: string;
  Title: string;
  Url: string;
  Visible: boolean;
}

export interface PagePickerTemplateVars {
  filterText: string;
  filteredSearch: PageSearchItem[];
  tree: PageTreeItem[];
}

export interface PageSearchItem {
  id: number;
  name: string;
  path: string;
}

export interface PageTreeItem {
  children: PageTreeItem[];
  id: number;
  name: string;
  parentId: number;
}
