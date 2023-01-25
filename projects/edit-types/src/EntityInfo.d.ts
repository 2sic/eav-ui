export interface EntityForPicker {
  /** New in v15, sometimes included to indicate if it's from the current app */
  AppId?: number;

  /** Prevent edit of this item for whatever reason, v15 */
  _disableEdit?: boolean;
}
export interface EntityInfo extends EntityForPicker {

  /** The EntityId */
  Id: number;

  /** The value to store */
  Value: string;

  /** The title to show in the dropdown */
  Text: string;

}
