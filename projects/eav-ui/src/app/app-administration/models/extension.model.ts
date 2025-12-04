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

export interface ExtensionInspectResult {
  foundLock: boolean;
  files: { path: string; status: FileStatus }[];
  summary: {
    total: number;
    changed: number;
    added: number;
    missing: number;
  };
  data: {
    contentTypes: {
      name: string;
      guid: Guid;
      localEntities: number;
    }[];
  };
}

export interface ExtensionInstallPreflightResult {
  Name: string;
  Version?: string;
  EditionsSupported: boolean;
  FileCount: number;
  Features: ExtensionFeaturesDto;
  Editions: ExtensionEditionDto[];
}

export interface ExtensionEditionDto {
  edition: string;
  isInstalled?: boolean | null;
  currentVersion?: string | null;
  hasFileChanges?: boolean | null;
  dataInside?: boolean | null;
  breakingChanges?: boolean | null;
}

export interface ExtensionFeaturesDto {
  inputFieldInside: boolean;
  razorInside: boolean;
  appCodeInside: boolean;
  webApiInside: boolean;
  contentTypesInside: boolean;
  queriesInside: boolean;
  viewsInside: boolean;
  dataInside: boolean;
}

export type FileStatus = 'unchanged' | 'added' | 'missing' | 'changed';
