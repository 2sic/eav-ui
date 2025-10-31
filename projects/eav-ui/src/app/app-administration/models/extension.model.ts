import { Guid } from "projects/field-string-wysiwyg/src/shared/guid";

export interface Extension {
  folder: string;
  configuration: ExtensionConfiguration | null;
}

export interface ExtensionConfiguration {
  copyright: string;
  createdBy: string;
  description: string;
  guid: Guid;
  hasAppCode: boolean;
  hasContentTypes: boolean;
  hasDataBundles: boolean;
  hasEntities: boolean;
  hasFields: boolean;
  hasQueries: boolean;
  hasRazor: boolean;
  hasViews: boolean;
  hasWebApi: boolean;
  name: string;
  nameId: Guid;
  teaser: string;
  version: number,
}