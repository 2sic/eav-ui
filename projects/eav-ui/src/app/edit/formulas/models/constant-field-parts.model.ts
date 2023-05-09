
import { FieldSettings } from "projects/edit-types";
import { InputType } from "../../../content-type-fields/models/input-type.model";
import { FieldLogicBase } from "../../form/shared/field-logic/field-logic-base";

// TODO: @SDV - I believe you don't need this any more, because you now have a typed FieldConstants
export interface ConstantFieldParts {
  logic: FieldLogicBase,
  settingsInitial: FieldSettings,
  inputType: InputType,
  constants: {
    fieldName: string,
  }
}