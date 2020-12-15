export interface ChildFormResult {
  updateEntityGuid: string;
  updateFieldId: number;
  /** On add, contains GUID and Id of newly added item */
  result: {
    [guid: string]: number;
  };
}

export interface NavigateFormResult {
  navigateUrl: string;
}
