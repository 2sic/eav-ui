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

  /**
   * If the page is visible in the navigation
   * Previously called `Visible`, changed to `IsNavigation` in v19.01
   */
  IsNavigation: boolean;

  /**
   * If the page would be clickable in the navigation, or just a name to show (usually opening sub-pages)
   * Previously called `Clickable`, changed to `IsClickable` in v19.01
   */
  IsClickable: boolean;
}

export interface PageSearchItem {
  id: number;
  name: string;
  path: string;
  isNavigation: boolean;
  isClickable: boolean;
}

export interface PageTreeItem extends Omit<PageSearchItem, 'path'> {
  children: PageTreeItem[];
  parentId: number;
}
