import { FieldMetadataModel } from '../models/field-metadata.model';

export const WrappersConstants = {
  AdamWrapper: 'app-adam-wrapper', // default
  CollapsibleWrapper: 'app-collapsible-wrapper', // empty specific
  DropzoneWrapper: 'app-dropzone-wrapper', // default
  PickerExpandableWrapper: 'app-picker-expandable-wrapper', // entity specific
  PickerPreviewWrapper: 'app-picker-preview-wrapper', // entity specific
  ExpandableWrapper: 'app-expandable-wrapper', // default
  HiddenWrapper: 'app-hidden-wrapper', // default
  HyperlinkDefaultExpandableWrapper: 'app-hyperlink-default-expandable-wrapper', // hyperlink specific
  HyperlinkLibraryExpandableWrapper: 'app-hyperlink-library-expandable-wrapper', // hyperlink specific
  LocalizationWrapper: 'app-localization-wrapper', // default
} as const;

export type WrappersConstant = typeof WrappersConstants[keyof typeof WrappersConstants];


export const WrappersLocalizationOnly: FieldMetadataModel = {
  wrappers: [WrappersConstants.LocalizationWrapper],
};