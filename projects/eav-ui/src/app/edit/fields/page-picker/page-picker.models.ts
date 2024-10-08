import { UntypedFormGroup } from '@angular/forms';
import { EntityLightIdentifier } from '../../../../../../edit-types/src/EntityLight';
import { FieldConfigSet } from '../field-config-set.model';

export interface PagePickerDialogData {
  config: FieldConfigSet;
  group: UntypedFormGroup;
}

export interface PageEntity extends EntityLightIdentifier {
  // Not used ATM
  // Created: string;
  // Modified: string;
  Name: string;

  /** The ID of the parent page */
  ParentId: number;

  /** The path of the page - probably without the http etc. */
  Path: string;

  /** The URL of the page */
  Url: string;

  /** If the page is visible in the navigation */
  Visible: boolean;

  /** If the page would be clickable in the navigation, or just a name to show (usually opening sub-pages) */
  Clickable: boolean;
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
