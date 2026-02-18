
export interface Extension {
  folder: string;
  edition: string;
  configuration: ExtensionConfiguration | null;
  icon: string | null;
}

export interface ReleaseNote {
  version: string;
  isBreaking: boolean;
  notes: string;
}

export interface ExtensionConfiguration {
  guid: string; // guid
  nameId: string; // guid
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
  releases: ReleaseNote[];
  sxcSupported: boolean;
  sxcVersionMin: string;
  dnnSupported: boolean;
  dnnVersionMin: string;
  oqtSupported: boolean;
  oqtVersionMin: string;
  resourcesContentType: string;
  settingsContentType: string;
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
      guid: string; // guid
      localEntities: number;
    }[];
  };
}

export interface ExtensionPreflightItem {
  name: string;
  version: string;
  editionsSupported: boolean;
  fileCount: number;
  features: ExtensionFeatures;
  editions: ExtensionEdition[];
}

export interface ExtensionEdition {
  edition: string;
  isInstalled?: boolean | null;
  currentVersion?: string | null;
  hasFileChanges?: boolean | null;
  dataInside?: boolean | null;
  breakingChanges?: boolean | null;
}

export interface ExtensionFeatures {
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

export const DefaultExtensionEdition = 'Default';