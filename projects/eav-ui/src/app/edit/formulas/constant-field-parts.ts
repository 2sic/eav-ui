
import { FieldSettings } from "projects/edit-types";
import { InputType } from "../../content-type-fields/models/input-type.model";
import { FieldLogicBase } from "../form/shared/field-logic/field-logic-base";

export interface ConstantFieldParts {
  logic: FieldLogicBase,
  settingsInitial: FieldSettings,
  inputType: InputType,
  constants: {
    fieldName: string,
  }
}