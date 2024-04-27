import { UntypedFormGroup } from '@angular/forms';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { EntityBasic } from '../../../shared/models/entity-basic';

export interface PagePickerDialogData {
  config: FieldConfigSet;
  group: UntypedFormGroup;
}

export interface PageEntity extends EntityBasic {
  // Created: string;
  // Modified: string;
  Name: string;
  ParentId: number;
  Path: string;
  Url: string;
  Visible: boolean;

  /** If the page would be clickable in the navigation, or just a name to show (usually opening sub-pages) */
  Clickable: boolean;
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
