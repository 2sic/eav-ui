export const WrappersConstants = {
  // empty specific
  CollapsibleWrapper: 'app-collapsible-wrapper',
  // default wrappers
  HiddenWrapper: 'app-hidden-wrapper',
  DropzoneWrapper: 'app-dropzone-wrapper',
  LocalizationWrapper: 'app-localization-wrapper',
  ExpandableWrapper: 'app-expandable-wrapper',
  AdamWrapper: 'app-adam-wrapper',
  // entity specific
  EntityExpandableWrapper: 'app-entity-expandable-wrapper',
  // hyperlink specific
  HyperlinkDefaultExpandableWrapper: 'app-hyperlink-default-expandable-wrapper',
  HyperlinkLibraryExpandableWrapper: 'app-hyperlink-library-expandable-wrapper',
} as const;

export type WrappersConstant = typeof WrappersConstants[keyof typeof WrappersConstants];
