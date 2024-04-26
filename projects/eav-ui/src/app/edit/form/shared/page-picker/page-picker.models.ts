import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { QueryEntity } from '../../fields/picker/models/query-entity.model';

export interface PagePickerDialogData {
  config: FieldConfigSet;
  group: UntypedFormGroup;
}

export interface PageEntity extends QueryEntity {
  Created: string;
  Guid: string;
  Id: number;
  // 2024-04-26 2dm removed this, don't think it's used and believe it's a leftover #cleanup-picker
  // Modified: string;
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
