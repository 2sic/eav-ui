export type EavMetadataKey = 'attribute' | 'app' | 'entity' | 'contentType' | 'zone' | 'cmsObject';
const EavKeyTypes = {
  Guid: 'guid',
  String: 'string',
  Number: 'number',
} as const;
export type EavKeyTypeKey = typeof EavKeyTypes[keyof typeof EavKeyTypes];
export interface EavScopeOption { name: string; value: string; }

export const eavConstants = {
  metadata: {
    /** metadataOfAttribute */
    attribute: { type: 2, target: 'EAV Field Properties', label: 'Content-Type Field/Attribute (2)', keyType: EavKeyTypes.Number },
    /** metadataOfApp */
    app: { type: 3, target: 'App', label: 'App (3)', keyType: EavKeyTypes.Number },
    /** metadataOfEntity */
    entity: { type: 4, target: 'Entity', label: 'Entity (4)', keyType: EavKeyTypes.Guid },
    /** metadataOfContentType */
    contentType: { type: 5, target: 'ContentType', label: 'Content-Type (5)', keyType: EavKeyTypes.String },
    /** metadataOfZone */
    zone: { type: 6, target: 'Zone', label: 'Zone (6) - not used as of now', keyType: EavKeyTypes.Number },
    /** metadataOfCmsObject */
    cmsObject: { type: 10, target: 'CmsObject', label: 'Cms Object (10)', keyType: EavKeyTypes.String, hint: 'Usually this is "file:400" or "folder:4030"' },
  },

  /** Loopup type for the metadata, e.g. key=80adb152-efad-4aa4-855e-74c5ef230e1f is keyType=guid */
  keyTypes: {
    guid: EavKeyTypes.Guid,
    string: EavKeyTypes.String,
    number: EavKeyTypes.Number,
  },

  /** Scopes */
  scopes: {
    /** This is the main schema and the data you usually see is from here */
    default: { name: 'Default', value: '2SexyContent' },
    /** This contains content-types for configuration, settings and resources of the app */
    app: { name: 'System: App', value: '2SexyContent-App' },
    /** This contains special app settings */
    configuration: { name: 'Configuration', value: 'System.Configuration' },
  },

  /** Content types where templates, permissions, etc. are stored */
  contentTypes: {
    /** Content type containing app templates (views) */
    template: '2SexyContent-Template',
    /** Content type containing permissions */
    permissions: 'PermissionConfiguration',
    /** Content type containing queries */
    query: 'DataPipeline',
    /** Content type containing content type metadata (app administration > data > metadata) */
    contentType: 'ContentType',
    /** Content type containing app settings */
    settings: 'App-Settings',
    /** Content type containing app resources */
    resources: 'App-Resources',
    /** Content type containing app settings */
    systemSettings: 'SystemSettings',
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
        // disable for https://github.com/2sic/2sxc/issues/2388 - remove in a few iterations ca. 2021-05
        // {
        //   EntityGuid: 'unsaved3',
        //   PartAssemblyAndType: 'ToSic.Eav.DataSources.IAppRoot, ToSic.Eav.DataSources',
        //   VisualDesignerData: { Top: 440, Left: 440 },
        // }, {
        //   EntityGuid: 'unsaved2',
        //   PartAssemblyAndType: 'ToSic.Eav.DataSources.PublishingFilter, ToSic.Eav.DataSources',
        //   VisualDesignerData: { Top: 300, Left: 440 },
        // },
        {
          EntityGuid: 'unsaved1',
          PartAssemblyAndType: 'ToSic.Sxc.DataSources.CmsBlock, ToSic.Sxc',
          VisualDesignerData: { Top: 170, Left: 440 },
        }
      ],
      streamWiring: [
        // disable for https://github.com/2sic/2sxc/issues/2388 - remove in a few iterations ca. 2021-05
        // { From: 'unsaved3', Out: 'Default', To: 'unsaved2', In: 'Default' },
        // { From: 'unsaved3', Out: 'Drafts', To: 'unsaved2', In: 'Drafts' },
        // { From: 'unsaved3', Out: 'Published', To: 'unsaved2', In: 'Published' },
        // { From: 'unsaved2', Out: 'Default', To: 'unsaved1', In: 'Default' },
        { From: 'unsaved1', Out: 'Header', To: 'Out', In: 'Header' },
        { From: 'unsaved1', Out: 'Default', To: 'Out', In: 'Default' },
      ],
    },
    testParameters: '[Demo:Demo]=true',
  },
};
