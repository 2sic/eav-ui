import { TranslateService } from '@ngx-translate/core';
import { EntityLight } from '../../../../../../../edit-types/src/EntityLight';

export interface PickerItem {
  /** The title to show in the dropdown */
  label: string;

  /** The value to store */
  value: string;

  /** The previewValue to Show (Icon, etc.) */
  previewValue?: string;

  /** The HTML to show in the preview */
  previewHtml?: string;

  /**
   * The entity Id, only used to enable edit etc. if the item is an entity.
   */
  id?: number;

  /**
   * Prevent edit of this item for whatever reason, v15
   * This property does not come from the server, but must be added by code.
   */
  noEdit?: boolean;

  noRemove?: boolean;

  /**
   * Prevent delete of this item for whatever reason, v15
   * This property does not come from the server, but must be added by code.
   */
  noDelete?: boolean;

  /**
   * Prevent select of this item for whatever reason, v16
   * It was originally added so "no query" message will be shown in the dropdown.
   * This property does not come from the server, but must be added by code.
   *
   * TODO: this is not quite correct, the UI seems to use and then look if re-select is allowed,
   * but it's usually true for error messages...
   */
  noSelect?: boolean;


  /**
   * The tooltip that is seen on hover over item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   */
  tooltip?: string;

  /**
   * The data that is seen on click on information icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   */
  info?: string;

  /**
   * The data that is seen on click on help icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   */
  link?: string;

  /**
   * The streamName is used for tree config when we have data from multiple streams and they have same Ids.
   * This property does not come from the server, but must be added by code from the settings.
   */
  sourceStreamName?: string;

  /**
   * Indicate that this item is an error or message, which means it should not be selectable and it should
   * also not be filtered out.
   */
  isMessage?: boolean;

  /**
   * The data of the underlying original entity.
   * Used in formulas and field masks for all properties.
   * Named `data` and not `entity` because in theory the data could come from elsewhere and never be an entity. 
   */
  data?: EntityLight;

  /**
   * WIP to list features required for this item.
   * 
   * Goal is to probably have a CSV always consisting of prefix like 
   * 
   * * `feature:` and then a feature ID such as `feature:PickerUiRadio` + a possible action such as `hint=feature:PickerUiRadio`
   * * later `package:` and then a package
   * * later `permission:` and then a permission
   * 
   * Important: This is beta and not for public use; ATM used in the radio/checkboxes of pickers and only there.
   * It can still change at any time, both format and implementation.
   */
  rules?: string;

}

export class PickerItemFactory {

  /** Generate a placeholder item to show in the list to show during loading or in case of error */
  static placeholder(translate: TranslateService, i18nLabel: string, suffix?: string): PickerItem {
    return {
      label: translate.instant(i18nLabel) + (suffix ?? ''),
      value: null,
      noSelect: true,
      isMessage: true,
      noDelete: true,
      noEdit: true,
    } satisfies PickerItem;
  }

  /** Generate a placeholder item to show in the list to show during loading or in case of error */
  static message(translate: TranslateService, i18nLabel: string, params?: object): PickerItem {
    return {
      label: translate.instant(i18nLabel, params),
      value: null,
      noSelect: true,
      isMessage: true,
      noDelete: true,
      noEdit: true,
    } satisfies PickerItem;
  }
}
