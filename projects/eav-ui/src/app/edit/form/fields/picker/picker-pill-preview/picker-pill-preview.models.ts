import { BaseFieldViewModel } from "../../base/base-field-template-vars.model";
import { SelectedEntity } from "../../entity/entity-default/entity-default.models";

export interface PickerPillPreviewTemplateVars extends BaseFieldViewModel {
  selectedEntities: SelectedEntity[];
  entitiesNumber: number;
  isOpen: boolean;
}
