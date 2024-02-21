export interface EavFor {
  Target: string;
  TargetType: number;
  Number?: number;
  String?: string;
  Guid?: string;
  /** New in 11.11+ - if true, the backend will try to find the entity matching this request */
  Singleton?: boolean;
  /** Title of the target entity */
  Title?: string;
}

/**
 * 2024-02-20 2dm created this because the UI wasn't showing the right data.
 * I wasn't sure if the EavFor above is used for other things, so I don't dare to just change things.
 * But to get the UI to show the correct values, it actually needs to use these properties.
 * 
 * Note that I'm pretty sure the original EavFor is used to create new data, 
 * but it doesn't seem to be the format returned from the backend in admin UIs.
 */
export interface EavForInAdminUi extends EavFor {
  KeyNumber?: number;
  KeyString?: string;
  KeyGuid?: string;
}