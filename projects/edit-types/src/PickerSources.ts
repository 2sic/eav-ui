import { FieldSettings } from './FieldSettings';



/** These properties are on basically all picker sources */
interface PickerSourceCommon {
  /** ItemInfo or field-mask for ItemInfo */
  ItemInformation: string;

  /** ItemTooltip or field-mask for ItemTooltip */
  ItemTooltip: string;

  /** ItemLink or field-mask for ItemLink */
  ItemLink: string;
}

interface PickerSourceCommonWithLabel {
  /** Label or field-mask for label */
  Label: string;
}


/**
 * Picker Source Custom CSS
 */
export interface PickerSourceCss extends String, PickerSourceCommon {
  CssSourceFile: string;
  CssSelectorFilter: string;
  Value: string;
  PreviewValue: string;

  /** Maybe the setting for the visualizer - eg. "none", "text", "icon-font", "icon-svg", "image" */
  PreviewType: string;
}

  

export interface PickerSourceCustomList {
  Values: string;
}


interface PickerSourceEntityAndQuery extends PickerSourceCommonWithLabel {
  CreateTypes: string;
  MoreFields: string;
}

export interface PickerSourceQuery extends PickerSourceEntityAndQuery {
  Query: string;
  QueryParameters: string;
  StreamName: string;
  Value: string;
  Label: string;
}

export interface PickerSourceEntity extends PickerSourceEntityAndQuery {
  ContentTypeNames: string;
}

export interface PickerSourceCustomCsv extends PickerSourceCommonWithLabel {
  Csv: string;
}


export interface UiPickerSourcesAll extends
  PickerSourceCustomList,
  PickerSourceCustomCsv,
  PickerSourceEntity,
  PickerSourceQuery,
  PickerSourceCss { }

/**
 * We want to have a clear type for field Settings which have more properties,
 * but we don't want the entire code base to assume that all these properties are present.
 */
export interface FieldSettingsWithPickerSource extends FieldSettings, Omit<UiPickerSourcesAll, 'CreateTypes' | 'Label' | 'MoreFields' | 'Query' | 'StreamName' | 'Value'> { }