
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
  tooltip?: string;
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

// New wysiwyg sizes
export const ImgRatios: ImageFormatDefinition[] = [
  ...buildFormatSizesDefinitions(2),
  ...buildFormatSizesDefinitions(3),
  ...buildFormatSizesDefinitions(4, [1, 3]),
  // ...buildMapOfEnhancedSizes(5),
  // { name: 'width10per', class: `${WysiwygClassPrefix}-w10per` },
  // { name: 'width20per', class: `${WysiwygClassPrefix}-w20per` },
  // { name: 'width30per', class: `${WysiwygClassPrefix}-w30per` },
];
export const ImgEnhancedRatioDefault = ImgRatios[0];

function buildFormatSizesDefinitions(max: number, keys?: number[]): ImageFormatDefinition[] {
  keys ??= [...[...Array(max).keys()].slice(1)]; // get keys from 1...max-1
  return keys.map((n) => ({
    name: `width${n}of${max}`,                    // eg 'width1of2' - important for i18n
    class: `${WysiwygClassPrefix}-${n}of${max}`,  // eg 'wysiwyg-1of2' - important for CSS
    tooltip: `${n} of ${max}`,                    // eg '1 of 2' - important for i18n
  })
  );
}

export const ImgEnhancedWidths: ImageFormatDefinition[]
  = [10, 20, 25, 30, 33, 40, 50, 60, 66, 75, 80]
    .map(percent => ({
      name: `width${percent}per`,
      class: `${WysiwygClassPrefix}-w${percent}per`,
      tooltip: `${percent}%`
    }
  ));

// console.log('2dm - sizes', ImgEnhancedRatios);
