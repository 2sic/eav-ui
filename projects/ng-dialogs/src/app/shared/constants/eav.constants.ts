const MetadataKeyTypes = {
  Guid: 'guid',
  String: 'string',
  Number: 'number',
} as const;
export type MetadataKeyType = typeof MetadataKeyTypes[keyof typeof MetadataKeyTypes];

export interface ScopeOption {
  name: string;
  value: string;
}

export const SystemSettingsScopes = {
  App: 'app',
  Site: 'site',
} as const;
export type SystemSettingsScope = typeof SystemSettingsScopes[keyof typeof SystemSettingsScopes];

export const eavConstants = {
  metadata: {
    /** Metadata of Attribute */
    // tslint:disable-next-line:max-line-length
    attribute: { targetType: 2, target: 'EAV Field Properties', label: 'Content-Type Field/Attribute (2)', keyType: MetadataKeyTypes.Number },
    /** Metadata of App */
    app: { targetType: 3, target: 'App', label: 'App (3)', keyType: MetadataKeyTypes.Number },
    /** Metadata of Entity */
    entity: { targetType: 4, target: 'Entity', label: 'Entity (4)', keyType: MetadataKeyTypes.Guid },
    /** Metadata of ContentType */
    contentType: { targetType: 5, target: 'ContentType', label: 'Content-Type (5)', keyType: MetadataKeyTypes.String },
    /** Metadata of Zone */
    zone: { targetType: 6, target: 'Zone', label: 'Zone (6) - not used as of now', keyType: MetadataKeyTypes.Number },
    /** Metadata of Language (a Dimension) */
    language: { targetType: 8, target: 'Dimension', label: 'Language (8)', keyType: MetadataKeyTypes.String },
    /** Metadata of CmsObject */
    cmsObject: { targetType: 10, target: 'CmsObject', label: 'Cms Object (10)', keyType: MetadataKeyTypes.String, hint: 'Usually this is "file:400" or "folder:4030"' },
  },

  /** Lookup type for the metadata, e.g. key=80adb152-efad-4aa4-855e-74c5ef230e1f is keyType=guid */
  keyTypes: {
    guid: MetadataKeyTypes.Guid,
    string: MetadataKeyTypes.String,
    number: MetadataKeyTypes.Number,
  },

  /** Scopes */
  scopes: {
    /** This is the main schema and the data you usually see is from here */
    default: { name: 'Default', value: 'Default' },
    configuration: { name: 'Configuration (Views etc.)', value: 'System.Configuration' },
  },

  /** Content types where templates, permissions, etc. are stored */
  contentTypes: {
    /** Content type containing app's specifications */
    appConfiguration: '2SexyContent-App',
    /** Content type containing app's views */
    template: '2SexyContent-Template',
    /** Content type containing permissions */
    permissions: 'PermissionConfiguration',
    /** Content type containing queries */
    query: 'DataPipeline',
    /** Content type containing content type metadata */
    contentType: 'ContentType',
    /** Content type containing app's custom settings */
    settings: 'App-Settings',
    /** Content type containing app's custom resources */
    resources: 'App-Resources',
    /** Content type containing app's system settings */
    systemSettings: 'SettingsSystem',
    /** Content type containing app's system resources */
    systemResources: 'ResourcesSystem',
    /** Content type containing Primary and Global App custom settings */
    customSettings: 'SettingsCustom',
    /** Content type containing Primary and Global App custom resources */
    customResources: 'ResourcesCustom',
  },

  pipelineDesigner: {
    dataSourceDifficulties: {
      default: 100,
      advanced: 200,
    },
    outDataSource: {
      Description: 'The template/script which will show this data',
      EntityGuid: 'Out',
      In: ['Default', 'Header'],
      Name: '2sxc Target (View or API)',
      PartAssemblyAndType: 'SexyContentTemplate',
      PrimaryType: 'Target',
      VisualDesignerData: { Top: 20, Left: 200, Width: 700 },
    },
    defaultPipeline: {
      dataSources: [
        {
          EntityGuid: 'unsaved1',
          PartAssemblyAndType: 'ToSic.Sxc.DataSources.CmsBlock, ToSic.Sxc',
          VisualDesignerData: { Top: 170, Left: 440 },
        }
      ],
      streamWiring: [
        { From: 'unsaved1', Out: 'Header', To: 'Out', In: 'Header' },
        { From: 'unsaved1', Out: 'Default', To: 'Out', In: 'Default' },
      ],
    },
    testParameters: '[Demo:Demo]=true',
  },
};
