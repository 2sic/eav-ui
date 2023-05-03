
import { InputType } from "../../content-type-fields/models/input-type.model";
import { FieldLogicBase } from "../form/shared/field-logic/field-logic-base";

export interface ConstantFieldParts {
  logic: FieldLogicBase,
  inputType: InputType
}