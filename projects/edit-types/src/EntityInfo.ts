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

  /** New in v15, sometimes included to indicate if it's from the current app */
  AppId?: number;

  /** The EntityId */
  Id?: number;

  /** The title to show in the dropdown */
  Text: string;
}

// TODO: @SDV - rename this to PickerItem
export interface WIPDataSourceItem extends EntityForPicker {

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

// TODO: @SDV - rename this to PickerTreeItem
export interface WIPDataSourceTreeItem extends WIPDataSourceItem {
  Level: number;
  Expandable: boolean;
}
