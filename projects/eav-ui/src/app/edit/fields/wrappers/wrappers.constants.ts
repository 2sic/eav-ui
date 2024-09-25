import { FieldMetadataModel } from '../field-metadata.decorator';

// Note: When creating new wrappers, do this
// 1. Create the component
// 2. Add it to the catalog above
// 3. Make sure the class name is unique...
// 4. ...and that i uses the name from the WrappersCatalog above
// 5. Then also register it in the `InputComponents` list with the name and control
// 6. If it should be applied to many controls, register in the `WrapperHelper` at the right place
// ...otherwise add it as a `@FieldMetadata` to the field (remember that this only works on the entry component)

export const WrappersCatalog = {
  AdamWrapper: 'app-adam-wrapper', // default
  CollapsibleWrapper: 'app-collapsible-wrapper', // empty specific
  DropzoneWrapper: 'app-dropzone-wrapper', // default
  PickerExpandableWrapper: 'app-picker-expandable-wrapper', // entity specific
  PickerPreviewWrapper: 'app-picker-preview-wrapper', // entity specific
  ExpandableWrapper: 'app-expandable-wrapper', // default
  HiddenWrapper: 'app-hidden-wrapper', // default
  FeatureWarningWrapper: 'app-feat-warnings-wrapper', // default
  HyperlinkDefaultExpandableWrapper: 'app-hyperlink-default-expandable-wrapper', // hyperlink specific
  HyperlinkLibraryExpandableWrapper: 'app-hyperlink-library-expandable-wrapper', // hyperlink specific
  LocalizationWrapper: 'app-localization-wrapper', // default
} as const /* the as const ensures that the keys/values can be strictly checked */;

export const WrappersLocalizationOnly: FieldMetadataModel = {
  wrappers: [WrappersCatalog.LocalizationWrapper],
};


