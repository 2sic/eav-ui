
// Wysiwyg Class Prefix for all CSS Classes which are for the rich mode
const WysiwygClassPrefix = 'wysiwyg';

// Classic / Basic Image Widths
export const ImgWidthPrefix = 'imgwidth';

// Helper structures to store the data
export interface ImageFormatDefinition {
  name: string;
  class: string;
  inherit?: string;
  icon?: string;
  label?: string;
  tooltip?: string;
  fraction?: number;
  fractionOf?: number;
}

// Content Splitters
export const SplitterName = 'splitter';
export const ContentSplitterClass = `${WysiwygClassPrefix}-${SplitterName}`;
export const ContentSplitters: ImageFormatDefinition[] = ['0', 's', 'm', 'l' /*, "xl" */].map((v) => ({
  name: `${SplitterName}${v}`,
  class: `${WysiwygClassPrefix}-spacer-${v}`,
  icon: `${SplitterName}${v}`,
}));

// New wysiwyg alignments
export const ImgLeft = `${WysiwygClassPrefix}-img-left`;
export const ImgCenter = `${WysiwygClassPrefix}-img-middle`;
export const ImgRight = `${WysiwygClassPrefix}-img-right`;
export const ImgAlignments: ImageFormatDefinition[] = [
  { name: ImgLeft, class: `${WysiwygClassPrefix}-left`, icon: `rich-image-left`, inherit: 'alignleft' },
  // { name: ImgCenter, class: `${WysiwygClassPrefix}-middle`, icon: `rich-image-center`, inherit: 'aligncenter' },
  { name: ImgRight, class: `${WysiwygClassPrefix}-right`, icon: `rich-image-right`, inherit: 'alignright' },
];

const i18nRatioPrefix = 'RichImages.Ratio';


// New wysiwyg sizes
const WysiwygWidthClassPrefix = `${WysiwygClassPrefix}-`;
export const ImgRatioDefault: ImageFormatDefinition = {
  name: 'width100',
  class: `${WysiwygWidthClassPrefix}100`,
  label: `${i18nRatioPrefix}100.Label`,
  tooltip: `${i18nRatioPrefix}100.Tooltip`,
};
export const ImgRatios: ImageFormatDefinition[] = [
  ImgRatioDefault,
  ...buildFormatSizesDefinitions(2),
  ...buildFormatSizesDefinitions(3),
  ...buildFormatSizesDefinitions(4, [1, 3]),
];

function buildFormatSizesDefinitions(max: number, keys?: number[]): ImageFormatDefinition[] {
  keys ??= [...[...Array(max).keys()].slice(1)]; // get keys from 1...max-1
  return keys.map(n => createFormatDefinition(n, max));
}

function createFormatDefinition(n: number, max: number, label?: string, tooltip?: string): ImageFormatDefinition {
  const fraction = Math.floor(100 * n / max);
  return ({
    name: `width-${fraction}`,
    class: `${WysiwygWidthClassPrefix}${fraction}`,
    label: label ?? `${i18nRatioPrefix}XofY.Label`,
    tooltip: tooltip ?? `${i18nRatioPrefix}XofY.Tooltip`,
    fraction: n,
    fractionOf: max,
  });
}
