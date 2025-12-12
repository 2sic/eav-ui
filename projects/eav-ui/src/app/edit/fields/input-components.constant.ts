import { Type } from '@angular/core';
import { InputTypeCatalog } from '../../shared/fields/input-type-catalog';
import { BooleanDefaultComponent } from './basic/boolean-default/boolean-default';
import { BooleanTristateComponent } from './basic/boolean-tristate/boolean-tristate';
import { CustomDefaultComponent } from './basic/custom-default/custom-default';
import { CustomJsonEditorComponent } from './basic/custom-json-editor/custom-json-editor';
import { DatetimeDefaultComponent } from './basic/datetime-default/datetime-default';
import { EmptyDefaultComponent } from './basic/empty-default/empty-default';
import { EmptyMessageComponent } from './basic/empty-message/empty-message';
import { EntityContentBlockComponent } from './basic/entity-content-blocks/entity-content-blocks';
import { EntityDefaultComponent } from './basic/entity-default/entity-default';
import { EntityPickerComponent } from './basic/entity-picker/entity-picker';
import { EntityQueryComponent } from './basic/entity-query/entity-query';
import { ExternalWebComponentComponent } from './basic/external-web-component/external-web-component';
import { HyperlinkDefaultComponent } from './basic/hyperlink-default/hyperlink-default';
import { HyperlinkLibraryComponent } from './basic/hyperlink-library/hyperlink-library';
import { NumberDefaultComponent } from './basic/number-default/number-default';
import { NumberDropdownComponent } from './basic/number-dropdown/number-dropdown';
import { NumberPickerComponent } from './basic/number-picker/number-picker';
import { StringDefaultComponent } from './basic/string-default/string-default';
import { StringDropdownQueryComponent } from './basic/string-dropdown-query/string-dropdown-query';
import { StringDropdownComponent } from './basic/string-dropdown/string-dropdown';
import { StringFontIconPickerComponent } from './basic/string-font-icon-picker/string-font-icon-picker';
import { StringPickerComponent } from './basic/string-picker/string-picker';
import { StringTemplatePickerComponent } from './basic/string-template-picker/string-template-picker';
import { StringUrlPathComponent } from './basic/string-url-path/string-url-path';
import { AdamWrapperComponent } from './wrappers/adam/adam-wrapper';
import { DropzoneWrapperComponent } from './wrappers/dropzone/dropzone-wrapper';
import { ExpandableWrapperComponent } from './wrappers/expand-dialog/expandable-wrapper';
import { FeatureWarningWrapperComponent } from './wrappers/feature-warning/feature-warning-wrapper';
import { CollapsibleWrapperComponent } from './wrappers/group/collapsible-wrapper';
import { HiddenWrapperComponent } from './wrappers/hidden/hidden-wrapper';
import { HyperlinkDefaultExpandableWrapperComponent } from './wrappers/hyperlink-dialog/hyperlink-default-expandable-wrapper';
import { HyperlinkLibraryExpandableWrapperComponent } from './wrappers/hyperlink-library-dialog/hyperlink-library-expandable-wrapper';
import { LocalizationWrapperComponent } from './wrappers/localization/localization-wrapper';
import { PickerExpandableWrapperComponent } from './wrappers/picker-dialog/picker-expandable-wrapper';
import { WrappersCatalog } from './wrappers/wrappers.constants';

export const InputComponents: Record<string, Type<any>> = {
  // Wrappers
  [WrappersCatalog.AdamWrapper]: AdamWrapperComponent,
  [WrappersCatalog.CollapsibleWrapper]: CollapsibleWrapperComponent,
  [WrappersCatalog.DropzoneWrapper]: DropzoneWrapperComponent,
  [WrappersCatalog.PickerExpandableWrapper]: PickerExpandableWrapperComponent,
  [WrappersCatalog.ExpandableWrapper]: ExpandableWrapperComponent,
  [WrappersCatalog.HiddenWrapper]: HiddenWrapperComponent,
  [WrappersCatalog.FeatureWarningWrapper]: FeatureWarningWrapperComponent,
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
  [InputTypeCatalog.NumberPicker]: NumberPickerComponent,
};
