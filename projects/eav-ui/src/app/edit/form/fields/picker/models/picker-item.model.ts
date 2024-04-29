export interface EntityForPicker {
  /** The EntityId */
  Id?: number;

  /** The title to show in the dropdown */
  Text: string;
}

export interface PickerItem extends EntityForPicker {
  /** 
   * AppId where the entity came from. 
   * It is sometimes included to indicate if it's from the current app,
   * eg. to check if edit is allowed. 
   * New it v15 when sometimes providing entities from multiple apps
   */
  AppId?: number;

  /** The value to store */
  Value: string;

  
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
   * The streamName is used for tree config when we have data from multiple streams and they have same Ids.
   * This property does not come from the server, but must be added by code from the settings.
   * That's why it has an underscore.
   */
  _streamName?: string;

  /**
   * The data of the underlying original entity.
   * Used in formulas and field masks for all properties.
   */
  data?: {
    [key: string]: any;  
  }
}
