
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

// New wysiwyg alignments
export const ContentSplitterClass = `${WysiwygClassPrefix}-division`;
export const ImgLeftClass = `${WysiwygClassPrefix}-img-left`;
export const ImgCenterClass = `${WysiwygClassPrefix}-img-center`;
export const ImgRightClass = `${WysiwygClassPrefix}-img-right`;
export const ImgAlignments: ImageFormatDefinition[] = [
  { name: ImgLeftClass, class: `${WysiwygClassPrefix}-left`, inherit: 'alignleft' },
  { name: ImgCenterClass, class: `${WysiwygClassPrefix}-center`, inherit: 'aligncenter' },
  { name: ImgRightClass, class: `${WysiwygClassPrefix}-right`, inherit: 'alignright' },
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

// Note: as of 2023-01-25 this is not actually in use, not sure if we need it
export const ImgEnhancedWidths: ImageFormatDefinition[]
  = [10, 20, 25, 30, 33, 40, 50, 60, 66, 75, 80]
    .map(percent => ({
      name: `width${percent}per`,
      class: `${WysiwygClassPrefix}-w${percent}per`,
      tooltip: `${percent}%`
    }
  ));

// console.log('2dm - sizes', ImgEnhancedRatios);
