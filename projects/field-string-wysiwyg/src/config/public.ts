// Name not final
// should contain public names / types

// Export Constant names because these will become standardized
// So people can use them in their custom toolbars
export const StylesGroup = 'styles-group'; // used to be 'formatgroup'
export const ImagesGroupPro = 'images-cms'; // used to be 'images'
export const LinkGroup = 'link-group';
export const LinkGroupPro = 'link-group-pro';
export const LinkFiles = 'link-files';
export const ListGroup = 'list-group';
export const ModeDefault = 'mode-standard';
export const LinkPageButton = 'link-page';
// export const ToModeInline = 'modeinline';
export const PasteImageButton = 'paste-image';
export const CodeButton = 'code';

export const ImgButtonGroupWidth = 'image-widths';
export const ImgButtonGroupRatios = 'image-ratios';

const WysiwygClassPrefix = 'wysiwyg';

// Classic / Basic Image Widths
export const ImgWidthPrefix = 'imgwidth';

// Helper structures to store the data
export interface FormatDefinition {
  name: string;
  class: string;
  inherit?: string;
  icon?: string;
  tooltip?: string;
}

// New wysiwyg alignments
export const ContentDivisionClass = `${WysiwygClassPrefix}-division`;
export const ImgEnhancedLeft = `${WysiwygClassPrefix}-img-left`;
export const ImgEnhancedCenter = `${WysiwygClassPrefix}-img-center`;
export const ImgEnhancedRight = `${WysiwygClassPrefix}-img-right`;
export const ImgEnhancedAlignments: FormatDefinition[] = [
  { name: ImgEnhancedLeft, class: `${WysiwygClassPrefix}-left`, inherit: 'alignleft' },
  { name: ImgEnhancedCenter, class: `${WysiwygClassPrefix}-center`, inherit: 'aligncenter' },
  { name: ImgEnhancedRight, class: `${WysiwygClassPrefix}-right`, inherit: 'alignright' },
];

// New wysiwyg sizes
export const ImgEnhancedRatios: FormatDefinition[] = [
  ...buildMapOfEnhancedSizes(2),
  ...buildMapOfEnhancedSizes(3),
  ...buildMapOfEnhancedSizes(4, [1, 3]),
  ...buildMapOfEnhancedSizes(5),


  { name: 'width10per', class: `${WysiwygClassPrefix}-w10per` },
  { name: 'width20per', class: `${WysiwygClassPrefix}-w20per` },
  { name: 'width30per', class: `${WysiwygClassPrefix}-w30per` },
];
export const ImgEnhancedRatioDefault = ImgEnhancedRatios[0];

function buildMapOfEnhancedSizes(max: number, keys?: number[]): FormatDefinition[] {
  keys ??= [...[...Array(max).keys()].slice(1)]; // get keys from 1...max-1
  return keys.map((n) => ({
    name: `width${n}of${max}`,
    class: `${WysiwygClassPrefix}-${n}of${max}`,
    tooltip: `${n} of ${max}`,
  })
  );
}

export const ImgEnhancedWidths: FormatDefinition[]
  = [10, 20, 25, 30, 33, 40, 50, 60, 66, 75, 80]
    .map(percent => ({
      name: `width${percent}per`,
      class: `${WysiwygClassPrefix}-w${percent}per`,
      tooltip: `${percent}%`
    }
  ));

// console.log('2dm - sizes', ImgEnhancedRatios);

// Heading Groups
export const HGroups = {
  h1: 'h1group',
  h2: 'h2group',
  h3: 'h3group',
  h4: 'h4group'
};

export const ToolbarModeToggle = 'wysiwyg-toolbar-mode';
export const ToolbarModes = 'wysiwyg-toolbar-modes';
// TODO: need better convention so we can use different names for mode switch
// same for `modestandard`
export const ModeAdvanced = 'modeadvanced';
export const AddContentBlock = 'addcontentblock';
export const ContentDivision = 'contentdivision';
export const DialogOpenButton = 'dialog-open';

export const AddContentSplit = 'contentsplit';

