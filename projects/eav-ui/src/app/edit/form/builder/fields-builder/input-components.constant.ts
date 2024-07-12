import { Type } from '@angular/core';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../shared/constants';
import { BooleanDefaultComponent } from '../../fields/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from '../../fields/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from '../../fields/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from '../../fields/custom/custom-json-editor/custom-json-editor.component';
import { ExternalWebComponentComponent } from '../../fields/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from '../../fields/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from '../../fields/empty/empty-default/empty-default.component';
import { EmptyMessageComponent } from '../../fields/empty/empty-message/empty-message.component';
import { EntityContentBlockComponent } from '../../fields/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultComponent } from '../../fields/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from '../../fields/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from '../../fields/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from '../../fields/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from '../../fields/number/number-default/number-default.component';
import { NumberDropdownComponent } from '../../fields/number/number-dropdown/number-dropdown.component';
import { StringDefaultComponent } from '../../fields/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from '../../fields/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from '../../fields/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from '../../fields/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from '../../fields/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from '../../fields/string/string-url-path/string-url-path.component';
import { AdamWrapperComponent } from '../../wrappers/adam-wrapper/adam-wrapper.component';
import { CollapsibleWrapperComponent } from '../../wrappers/collapsible-wrapper/collapsible-wrapper.component';
import { DropzoneWrapperComponent } from '../../wrappers/dropzone-wrapper/dropzone-wrapper.component';
import { ExpandableWrapperComponent } from '../../wrappers/expandable-wrapper/expandable-wrapper.component';
import { HiddenWrapperComponent } from '../../wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from '../../wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from '../../wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from '../../wrappers/localization-wrapper/localization-wrapper.component';
import { PickerExpandableWrapperComponent } from '../../wrappers/picker-expandable-wrapper/picker-expandable-wrapper.component';
import { EntityPickerComponent } from '../../fields/entity/entity-picker/entity-picker.component';
import { StringPickerComponent } from '../../fields/string/string-picker/string-picker.component';

export const InputComponents: Record<string, Type<any>> = {
  // Wrappers
  [WrappersConstants.AdamWrapper]: AdamWrapperComponent,
  [WrappersConstants.CollapsibleWrapper]: CollapsibleWrapperComponent,
  [WrappersConstants.DropzoneWrapper]: DropzoneWrapperComponent,
  [WrappersConstants.PickerExpandableWrapper]: PickerExpandableWrapperComponent,
  [WrappersConstants.ExpandableWrapper]: ExpandableWrapperComponent,
  [WrappersConstants.HiddenWrapper]: HiddenWrapperComponent,
  [WrappersConstants.HyperlinkDefaultExpandableWrapper]: HyperlinkDefaultExpandableWrapperComponent,
  [WrappersConstants.HyperlinkLibraryExpandableWrapper]: HyperlinkLibraryExpandableWrapperComponent,
  [WrappersConstants.LocalizationWrapper]: LocalizationWrapperComponent,

  // Input Types
  [InputTypeConstants.BooleanDefault]: BooleanDefaultComponent,
  [InputTypeConstants.BooleanTristate]: BooleanTristateComponent,
  [InputTypeConstants.CustomDefault]: CustomDefaultComponent,
  [InputTypeConstants.CustomJsonEditor]: CustomJsonEditorComponent,
  [InputTypeConstants.DateTimeDefault]: DatetimeDefaultComponent,
  [InputTypeConstants.EmptyDefault]: EmptyDefaultComponent,
  [InputTypeConstants.EmptyMessage]: EmptyMessageComponent,
  [InputTypeConstants.EntityContentBlocks]: EntityContentBlockComponent,
  [InputTypeConstants.EntityDefault]: EntityDefaultComponent,
  [InputTypeConstants.EntityQuery]: EntityQueryComponent,
  [InputTypeConstants.ExternalWebComponent]: ExternalWebComponentComponent,
  [InputTypeConstants.HyperlinkDefault]: HyperlinkDefaultComponent,
  [InputTypeConstants.HyperlinkLibrary]: HyperlinkLibraryComponent,
  [InputTypeConstants.NumberDefault]: NumberDefaultComponent,
  [InputTypeConstants.NumberDropdown]: NumberDropdownComponent,
  [InputTypeConstants.StringDefault]: StringDefaultComponent,
  [InputTypeConstants.StringDropdown]: StringDropdownComponent,
  [InputTypeConstants.StringDropdownQuery]: StringDropdownQueryComponent,
  [InputTypeConstants.StringFontIconPicker]: StringFontIconPickerComponent,
  [InputTypeConstants.StringJson]: CustomJsonEditorComponent,
  [InputTypeConstants.StringTemplatePicker]: StringTemplatePickerComponent,
  [InputTypeConstants.StringUrlPath]: StringUrlPathComponent,

  // Pickers
  [InputTypeConstants.EntityPicker]: EntityPickerComponent,
  [InputTypeConstants.StringPicker]: StringPickerComponent,
  [InputTypeConstants.NumberPicker]: NumberDropdownComponent,
};
