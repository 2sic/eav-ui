import { Of } from '../../../core';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { InputTypeMetadata } from '../../../shared/fields/input-type-metadata.model';

/** Information about the InputType */
export interface InputTypeSpecs {
  /** The strongly typed string name - which must be in the catalog of strict names */
  inputType: Of<typeof InputTypeCatalog>;

  /** info if it's an external web-component like the WYSIWYG */
  isExternal: boolean;

  /** Is the input type a string? */
  isString: boolean;

  /** Is the input type a new picker - eg. to modify Formula behavior */
  isNewPicker: boolean;

  /** The tag name of the component to use */
  componentTagName: string;

  componentTagDialogName: string;

  /** Additional information about the input type such as Angular Assets */
  metadata: InputTypeMetadata;
}
