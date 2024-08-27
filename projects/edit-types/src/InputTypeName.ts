import { InputTypeStrict } from 'projects/eav-ui/src/app/content-type-fields/constants/input-type.constants';

export interface AttributeInputType {
  /** Field name */
  name: string;
  /** Input type of this field */
  inputType: InputTypeStrict;
}
