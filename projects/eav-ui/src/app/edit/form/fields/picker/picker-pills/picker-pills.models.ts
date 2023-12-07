import { PickerItem } from "projects/edit-types";
import { BaseFieldViewModel } from "../../base/base-field-template-vars.model";

export interface PickerPillsViewModel extends BaseFieldViewModel {
  selectedItems: PickerItem[];
  itemsNumber: number;
  isOpen: boolean;
}
