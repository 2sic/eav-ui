export interface EntityForPicker {
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

  /** New in v15, sometimes included to indicate if it's from the current app */
  AppId?: number;

  /** The EntityId */
  Id?: number;

  /** The title to show in the dropdown */
  Text: string;
}

export interface PickerItem extends EntityForPicker {

  /** The value to store */
  Value: string;

  /** 
   * The tooltip that is seen on hover over item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  _tooltip?: string;

  /**
   * The data that is seen on click on information icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  _information?: string;

  /**
   * The data that is seen on click on help icon on item in the dropdown.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  _helpLink?: string;

  /**
   * The data that is added to the item in the dropdown through settings more fields.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  [key: string]: any;
}

export interface PickerTreeItem extends PickerItem {
  Level: number;
  Expandable: boolean;
}
