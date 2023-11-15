import { WIPDataSourceItem } from "projects/edit-types";
import { BaseFieldViewModel } from "../../base/base-field-template-vars.model";

export interface PickerPillPreviewTemplateVars extends BaseFieldViewModel {
  selectedEntities: WIPDataSourceItem[];
  entitiesNumber: number;
  isOpen: boolean;
}
