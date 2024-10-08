import { FieldSettings } from './FieldSettings';
export interface IFieldLogicBase {
  // log: ClassLogger<typeof logSpecs>;
  // name: string;
  // canAutoTranslate: boolean;
  // isValueEmpty(value: FieldValue, isCreateMode: boolean): boolean;
  update(updateSpecs: FieldLogicUpdate): FieldSettings;
  // findAndMergeAdvanced<T>(tools: FieldLogicTools, possibleGuid: string, defaults: T): T;
}