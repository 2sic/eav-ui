// TODO: @2dm
// - rename _tooltip to tooltip and all others with _ as well

import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';

export interface PickerItem {
  /** The title to show in the dropdown */
  label: string;
  
  /** The value to store */
  value: string;

  /**
   * The entity Id, only used to enable edit etc. if the item is an entity.
   */
  id?: number;

  /**
   * Prevent edit of this item for whatever reason, v15
   * This property does not come from the server, but must be added by code.
   * That's why it has an underscore.
   */
  _disableEdit?: boolean;

  /**
   * Prevent delete of this item for whatever reason, v15
   * This property does not come from the server, but must be added by code.
   * That's why it has an underscore.
   */
  _disableDelete?: boolean;

  /**
   * Prevent select of this item for whatever reason, v16
   * It was originally added so "no query" message will be shown in the dropdown.
   * This property does not come from the server, but must be added by code.
   * That's why it has an underscore.
   */
  _disableSelect?: boolean;


  /** 
   * The tooltip that is seen on hover over item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  tooltip?: string;

  /**
   * The data that is seen on click on information icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  infoBox?: string;

  /**
   * The data that is seen on click on help icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  helpLink?: string;

  /**
   * The streamName is used for tree config when we have data from multiple streams and they have same Ids.
   * This property does not come from the server, but must be added by code from the settings.
   */
  sourceStreamName?: string;

  /**
   * The data of the underlying original entity.
   * Used in formulas and field masks for all properties.
   */
  data?: EntityBasicWithFields;
}
