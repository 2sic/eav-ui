import { InputTypeStrict } from '../../eav-ui/src/app/shared/fields/input-type-catalog';

export interface AttributeInputType {
  /** Field name */
  name: string;
  /** Input type of this field */
  inputType: InputTypeStrict;
}
