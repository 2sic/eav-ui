import { BaseFieldTemplateVars } from "../../base/base-field-template-vars.model";
import { SelectedEntity } from "../../entity/entity-default/entity-default.models";

export interface PickerPillPreviewTemplateVars extends BaseFieldTemplateVars {
  selectedEntities: SelectedEntity[];
  entitiesNumber: number;
  isOpen: boolean;
}
