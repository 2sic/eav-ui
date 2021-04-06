import { PipelineDataSource } from '../models';

export type PlumbType = any;

export interface PlumbEditorTemplateModel {
  pipelineDataSources: PipelineDataSource[];
  typeInfos: TypeInfos;
  allowEdit: boolean;
}

export interface TypeInfos {
  [guid: string]: TypeInfo;
}

export interface TypeInfo {
  EnableConfig?: boolean;
  DynamicIn?: boolean;
  DynamicOut?: boolean;
  HelpLink?: string;
  Icon: string;
  Name: string;
  UiHint: string;
}

export interface GuiTypes {
  [key: string]: GuiType;
}

export interface GuiType {
  Icon: string;
  Name: string;
  UiHint: string;
}

export interface StreamInfo {
  name: string;
  required: boolean;
}
