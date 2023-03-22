export interface EntityForPicker {
  /**
   * Prevent edit of this item for whatever reason, v15
   * This property does not come from the server, but must be added by code.
   * That's why it has an underscore.
   */
  _disableEdit?: boolean;

  /** New in v15, sometimes included to indicate if it's from the current app */
  AppId?: number;

  /** The EntityId */
  Id: number;

  /** The title to show in the dropdown */
  Text: string;
}
export interface EntityInfo extends EntityForPicker {

  /** The value to store */
  Value: string;

}
