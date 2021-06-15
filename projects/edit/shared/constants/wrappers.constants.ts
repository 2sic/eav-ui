export const WrappersConstants = {
  // Empty specific
  CollapsibleWrapper: 'app-collapsible-wrapper',
  // Default wrappers
  HiddenWrapper: 'app-hidden-wrapper',
  DropzoneWrapper: 'app-dropzone-wrapper',
  LocalizationWrapper: 'app-localization-wrapper',
  ExpandableWrapper: 'app-expandable-wrapper',
  AdamAttachWrapper: 'app-adam-attach-wrapper',
  // Entity specific
  EntityExpandableWrapper: 'app-entity-expandable-wrapper',
  // Hyperlink specific
  HyperlinkDefaultExpandableWrapper: 'app-hyperlink-default-expandable-wrapper',
  HyperlinkLibraryExpandableWrapper: 'app-hyperlink-library-expandable-wrapper',
} as const;

export type WrappersConstant = typeof WrappersConstants[keyof typeof WrappersConstants];
