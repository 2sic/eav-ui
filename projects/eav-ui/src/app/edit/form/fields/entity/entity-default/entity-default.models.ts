export interface SelectedEntity {
  Id: number;
  Value: string;
  Text: string;
  _tooltip: string;
  // 2023-01-26 2dm - moved to disableEdit / disableDelete
  // isFreeTextOrNotFound: boolean;
  _disableEdit: boolean;
  _disableDelete: boolean;
  /** debug info only */
  _sourceIsQuery: boolean;
}
