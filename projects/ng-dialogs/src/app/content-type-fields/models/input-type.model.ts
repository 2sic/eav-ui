
/**
 * New Base class for InputType and FieldInputTypeOption - should be merged at some point
 */
export interface InputTypeNew {
  /**
   * If the type is obsolete, this will contain a message
   * New in 12.10
   */
   IsObsolete?: boolean;

    /**
   * If the type is obsolete, this will contain a message
   * New in 12.10
   */
   ObsoleteMessage?: string;

   /**
    * Determines if this is the initially selected input type
    * New in 12.10
    */
   IsDefault?: boolean;

   /**
    * Mark this as recommended
    * New in 12.10
    */
   IsRecommended?: boolean;
}

export interface InputType extends InputTypeNew {
  AngularAssets: string;
  Assets: string;
  Description: string;
  DisableI18n: boolean;
  Label: string;
  Type: string;
  UseAdam: boolean;
}
