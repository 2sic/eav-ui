export interface Language {
  readonly code: string;
  /** Previously name */
  readonly culture: string;
  readonly isAllowed: boolean;
  readonly isEnabled: boolean;
  /** Previously key */
  readonly nameId: string;
}
