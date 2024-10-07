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

interface HasPreviewType {
  /** Maybe the setting for the visualizer - eg. "none", "text", "icon-font", "icon-svg", "image" */
  PreviewType: string;
}

interface HasPreviewTypeAndValue extends HasPreviewType {
  /** PreviewValue or field-mask for PreviewValue */
  PreviewValue: string;
}

/**
 * Picker Source Custom CSS
 */
export interface PickerSourceCss extends PickerSourceCommon, HasPreviewTypeAndValue {
  CssSourceFile: string;
  CssSelectorFilter: string;
  Value: string;
}



export interface PickerSourceCustomList {
  Values: string;
}


interface PickerSourceEntityAndQuery extends PickerSourceCommonWithLabel {
  CreateTypes: string;
  /** WIP */
  CreatePrefill: string;
  /** WIP */
  CreateParameters: string;
  /** WIP */
  EditParameters: string;
  
  /** Additional fields to retrieve for whatever purpose... */
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

/**
 * This will use the query 'System.AppAssets' with the following parameters:
 * - ?rootFolder=...&fileFilter=...&assetType=...
 */
export interface PickerSourceAppAssets extends PickerSourceCommon, HasPreviewType {
  /** e.g. '/', '/icons/' */
  AssetsRootFolder: string,

  AssetsType: 'files' | 'folders' | 'all',

  /** e.g. '*.svg' */
  AssetsFileFilter: string,
}


export interface UiPickerSourcesAll extends
  PickerSourceCustomList,
  PickerSourceCustomCsv,
  PickerSourceEntity,
  PickerSourceQuery,
  PickerSourceCss,
  PickerSourceAppAssets
  { }

/**
 * We want to have a clear type for field Settings which have more properties,
 * but we don't want the entire code base to assume that all these properties are present.
 */
export interface FieldSettingsWithPickerSource extends FieldSettings, Omit<UiPickerSourcesAll, 'CreateTypes' | 'Label' | 'MoreFields' | 'Query' | 'StreamName' | 'Value'> { }
