import { PipelineDataSource } from '../models/pipeline.model';

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
  config?: boolean;
  dynamicOut?: boolean;
  helpLink?: string;
  icon: string;
  name: string;
  notes: string;
}

export interface GuiTypes {
  [key: string]: GuiType;
}

export interface GuiType {
  icon: string;
  name: string;
  notes: string;
}
