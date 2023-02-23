
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
const SplitterName = 'split';
export const ContentSplitterClass = `${WysiwygClassPrefix}-division`;
export const ContentSplitters: ImageFormatDefinition[] = [
  { name: SplitterName + "0", class: `wysiwyg-height-0`, icon: `rich-${SplitterName}-0` },
  { name: SplitterName + "s", class: `wysiwyg-height-s`, icon: `rich-${SplitterName}-s` },
  { name: SplitterName + "m", class: `wysiwyg-height-m`, icon: `rich-${SplitterName}-m` },
  { name: SplitterName + "l", class: `wysiwyg-height-l`, icon: `rich-${SplitterName}-l` },
  { name: SplitterName + "xl", class: `wysiwyg-height-xl`, icon: `rich-${SplitterName}-xl` },
];

// New wysiwyg alignments
export const ImgLeft = `${WysiwygClassPrefix}-img-left`;
export const ImgCenter = `${WysiwygClassPrefix}-img-center`;
export const ImgRight = `${WysiwygClassPrefix}-img-right`;
export const ImgAlignments: ImageFormatDefinition[] = [
  { name: ImgLeft, class: `${WysiwygClassPrefix}-left`, icon: `rich-image-left`, inherit: 'alignleft' },
  { name: ImgCenter, class: `${WysiwygClassPrefix}-center`, icon: `rich-image-center`, inherit: 'aligncenter' },
  { name: ImgRight, class: `${WysiwygClassPrefix}-right`, icon: `rich-image-right`, inherit: 'alignright' },
];

const i18nRatioPrefix = 'RichImages.Ratio';

// New wysiwyg sizes
// export const ImgRatioDefault = createFormatDefinition(1, 1, `${i18nRatioPrefix}100.Label`, `${i18nRatioPrefix}100.Tooltip`);
export const ImgRatioDefault: ImageFormatDefinition = {
  name: 'width100',
  class: `${WysiwygClassPrefix}-100`,
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
  return ({
    name: `width${n}of${max}`,
    class: `${WysiwygClassPrefix}-${n}of${max}`,
    label: label ?? `${i18nRatioPrefix}XofY.Label`,
    tooltip: tooltip ?? `${i18nRatioPrefix}XofY.Tooltip`,
    fraction: n,
    fractionOf: max,
  });
}

// console.log('2dm - sizes', ImgEnhancedRatios);
