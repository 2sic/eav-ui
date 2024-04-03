
/**
 * Describes if a data-source is configured to use masks.
 * Masks are strings with placeholders, vs. just the name of the field to show.
 */
export interface DataSourceMasks {
  /** Will be true if any of the values require mask-processing - pre-calculated for performance */
  hasMask: boolean;

  /** The tooltip value or mask */
  tooltip: string;

  /** The information value or mask */
  info: string;

  /** The link value or mask */
  link: string;

  /** The label value or mask */
  label: string;

  /** The value value or mask */
  value: string;
};

