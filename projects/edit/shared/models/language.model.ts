export interface Language {
  readonly Code: string;
  /** Previously name */
  readonly Culture: string;
  readonly IsAllowed: boolean;
  readonly IsEnabled: boolean;
  /** Previously key */
  readonly NameId: string;
}
