export interface PickerViewModel {
  shouldPickerListBeShown: boolean;
  allowMultiValue: boolean;
  isDialog: boolean;
  noSelectedEntities: number;
}

export interface DeleteEntityProps {
  index: number;
  entityGuid: string;
}
