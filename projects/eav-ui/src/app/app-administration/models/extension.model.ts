import { Guid } from "projects/field-string-wysiwyg/src/shared/guid";

export interface Extension {
  folder: string;
  configuration: ExtensionConfiguration | null;
}

export interface ExtensionConfiguration {
  guid: Guid;
  nameId: Guid;
  isInstalled: boolean;
  name: string;
  version: string;
  teaser: string;
  description: string;
  createdBy: string;
  copyright: string;
  linkMain: string;
  linkDemo: string;
  linkDocs: string;
  linkSource: string;
  hasFields: boolean;
  hasAppCode: boolean;
  hasWebApi: boolean;
  hasRazor: boolean;
  hasDataBundles: boolean;
  bundles: string;
  hasContentTypes: boolean;
  hasQueries: boolean;
  hasViews: boolean;
  hasEntities: boolean;
  releases: string[]; // Adjust if different
  sxcSupported: boolean;
  sxcVersionMin: string;
  dnnSupported: boolean;
  dnnVersionMin: string;
  oqtSupported: boolean;
  oqtVersionMin: string;
}