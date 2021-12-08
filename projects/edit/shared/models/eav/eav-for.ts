export interface EavFor {
  Target: string;
  Number?: number;
  String?: string;
  Guid?: string;
  /** New in 11.11+ - if true, the backend will try to find the entity matching this request */
  Singleton?: boolean;
  /** Title of the target entity */
  Title?: string;
}
