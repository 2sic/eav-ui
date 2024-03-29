import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { QueryEntity } from '../../fields/entity/entity-query/entity-query.models';

export interface PagePickerDialogData {
  config: FieldConfigSet;
  group: UntypedFormGroup;
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

export interface PagePickerViewModel {
  filterText: string;
  filteredSearch: PageSearchItem[];
  tree: PageTreeItem[];
}

export interface PageSearchItem {
  id: number;
  name: string;
  path: string;
  isVisible: boolean;
  isClickable: boolean;
}

export interface PageTreeItem extends Omit<PageSearchItem, 'path'> {
  children: PageTreeItem[];
  parentId: number;
}
