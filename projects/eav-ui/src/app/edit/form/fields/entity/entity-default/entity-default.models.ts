export interface SelectedEntity {
  entityId: number;
  value: string;
  label: string;
  tooltip: string;
  // 2023-01-26 2dm - moved to disableEdit / disableDelete
  // isFreeTextOrNotFound: boolean;
  disableEdit: boolean;
  disableDelete: boolean;
  /** debug info only */
  _sourceIsQuery: boolean;
}
