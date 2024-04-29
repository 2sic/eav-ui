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
   */
  noEdit?: boolean;

  /**
   * Prevent delete of this item for whatever reason, v15
   * This property does not come from the server, but must be added by code.
   */
  noDelete?: boolean;

  /**
   * Prevent select of this item for whatever reason, v16
   * It was originally added so "no query" message will be shown in the dropdown.
   * This property does not come from the server, but must be added by code.
   */
  notSelectable?: boolean;


  /** 
   * The tooltip that is seen on hover over item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   */
  tooltip?: string;

  /**
   * The data that is seen on click on information icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   */
  infoBox?: string;

  /**
   * The data that is seen on click on help icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
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
