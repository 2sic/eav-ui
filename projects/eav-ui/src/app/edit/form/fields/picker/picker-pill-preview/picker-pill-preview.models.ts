import { WIPDataSourceItem } from "projects/edit-types";
import { BaseFieldViewModel } from "../../base/base-field-template-vars.model";

export interface PickerPillPreviewViewModel extends BaseFieldViewModel {
  selectedEntities: WIPDataSourceItem[];
  entitiesNumber: number;
  isOpen: boolean;
}
