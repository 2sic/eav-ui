/**
 * Lightweight Entity containing all the properties in the Upper-case format.
 * 
 * Used to represent a raw/original entity in the system.
 */
export interface EntityLightIdentifier {

  /**
   * AppId where the entity came from - not provided in most scenarios.
   * It is sometimes included to indicate if it's from the current app,
   * eg. to check if edit is allowed.
   *
   * New it v15 when sometimes providing entities from multiple apps.
   * Example is when fields of type string-wysiwyg are configured, in which case
   * - most of the configs are global/shared, and shouldn't be edited
   * - some configs could be at the app level, and should be editable
   */
  AppId?: number;

  /** The entity ID */
  Id: number;

  /** The Guid, new, WIP */
  Guid: string;


  /** The title, new, WIP */
  Title: string;
}

/**
 * Lightweight Entity containing all the properties in the original - usually Upper-case - format.
 */
export interface EntityLight extends EntityLightIdentifier {
  [key: string]: any;
}
