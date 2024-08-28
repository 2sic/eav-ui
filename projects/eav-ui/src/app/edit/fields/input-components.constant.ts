import { Type } from '@angular/core';
import { InputTypeCatalog } from '../../shared/fields/input-type-catalog';
import { BooleanDefaultComponent } from './basic/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from './basic/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from './basic/custom-default/custom-default.component';
import { DatetimeDefaultComponent } from './basic/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from './basic/empty-default/empty-default.component';
import { EmptyMessageComponent } from './basic/empty-message/empty-message.component';
import { EntityContentBlockComponent } from './basic/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultComponent } from './basic/entity-default/entity-default.component';
import { EntityQueryComponent } from './basic/entity-query/entity-query.component';
import { AdamWrapperComponent } from './wrappers/adam/adam-wrapper.component';
import { CollapsibleWrapperComponent } from './wrappers/group/collapsible-wrapper.component';
import { DropzoneWrapperComponent } from './wrappers/dropzone/dropzone-wrapper.component';
import { ExpandableWrapperComponent } from './wrappers/expand-dialog/expandable-wrapper.component';
import { HiddenWrapperComponent } from './wrappers/hidden/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from './wrappers/hyperlink-dialog/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from './wrappers/hyperlink-library-dialog/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from '../fields/wrappers/localization/localization-wrapper.component';
import { PickerExpandableWrapperComponent } from './wrappers/picker-dialog/picker-expandable-wrapper.component';
import { EntityPickerComponent } from './basic/entity-picker/entity-picker.component';
import { NumberDefaultComponent } from './basic/number-default/number-default.component';
import { NumberDropdownComponent } from './basic/number-dropdown/number-dropdown.component';
import { HyperlinkDefaultComponent } from './basic/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from './basic/hyperlink-library/hyperlink-library.component';
import { CustomJsonEditorComponent } from './basic/custom-json-editor/custom-json-editor.component';
import { ExternalWebComponentComponent } from './basic/external-web-component/external-web-component.component';
import { StringDefaultComponent } from './basic/string-default/string-default.component';
import { StringDropdownQueryComponent } from './basic/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from './basic/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from './basic/string-font-icon-picker/string-font-icon-picker.component';
import { StringPickerComponent } from './basic/string-picker/string-picker.component';
import { StringTemplatePickerComponent } from './basic/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from './basic/string-url-path/string-url-path.component';
import { WrappersCatalog } from './wrappers/wrappers.constants';

export const InputComponents: Record<string, Type<any>> = {
  // Wrappers
  [WrappersCatalog.AdamWrapper]: AdamWrapperComponent,
  [WrappersCatalog.CollapsibleWrapper]: CollapsibleWrapperComponent,
  [WrappersCatalog.DropzoneWrapper]: DropzoneWrapperComponent,
  [WrappersCatalog.PickerExpandableWrapper]: PickerExpandableWrapperComponent,
  [WrappersCatalog.ExpandableWrapper]: ExpandableWrapperComponent,
  [WrappersCatalog.HiddenWrapper]: HiddenWrapperComponent,
  [WrappersCatalog.HyperlinkDefaultExpandableWrapper]: HyperlinkDefaultExpandableWrapperComponent,
  [WrappersCatalog.HyperlinkLibraryExpandableWrapper]: HyperlinkLibraryExpandableWrapperComponent,
  [WrappersCatalog.LocalizationWrapper]: LocalizationWrapperComponent,

  // Input Types
  [InputTypeCatalog.BooleanDefault]: BooleanDefaultComponent,
  [InputTypeCatalog.BooleanTristate]: BooleanTristateComponent,
  [InputTypeCatalog.CustomDefault]: CustomDefaultComponent,
  [InputTypeCatalog.CustomJsonEditor]: CustomJsonEditorComponent,
  [InputTypeCatalog.DateTimeDefault]: DatetimeDefaultComponent,
  [InputTypeCatalog.EmptyDefault]: EmptyDefaultComponent,
  [InputTypeCatalog.EmptyMessage]: EmptyMessageComponent,
  [InputTypeCatalog.EntityContentBlocks]: EntityContentBlockComponent,
  [InputTypeCatalog.EntityDefault]: EntityDefaultComponent,
  [InputTypeCatalog.EntityQuery]: EntityQueryComponent,
  [InputTypeCatalog.ExternalWebComponent]: ExternalWebComponentComponent,
  [InputTypeCatalog.HyperlinkDefault]: HyperlinkDefaultComponent,
  [InputTypeCatalog.HyperlinkLibrary]: HyperlinkLibraryComponent,
  [InputTypeCatalog.NumberDefault]: NumberDefaultComponent,
  [InputTypeCatalog.NumberDropdown]: NumberDropdownComponent,
  [InputTypeCatalog.StringDefault]: StringDefaultComponent,
  [InputTypeCatalog.StringDropdown]: StringDropdownComponent,
  [InputTypeCatalog.StringDropdownQuery]: StringDropdownQueryComponent,
  [InputTypeCatalog.StringFontIconPicker]: StringFontIconPickerComponent,
  [InputTypeCatalog.StringJson]: CustomJsonEditorComponent,
  [InputTypeCatalog.StringTemplatePicker]: StringTemplatePickerComponent,
  [InputTypeCatalog.StringUrlPath]: StringUrlPathComponent,

  // Pickers
  [InputTypeCatalog.EntityPicker]: EntityPickerComponent,
  [InputTypeCatalog.StringPicker]: StringPickerComponent,
  [InputTypeCatalog.NumberPicker]: NumberDropdownComponent,
};
