export type EavMetadataKey = 'attribute' | 'app' | 'entity' | 'contentType' | 'zone' | 'cmsObject';
export type EavKeyTypeKey = 'guid' | 'string' | 'number';
export interface EavScopeOption { name: string; value: string; }

export const eavConstants = {
  metadata: {
    /** metadataOfAttribute */
    attribute: { type: 2, target: 'EAV Field Properties' },
    /** metadataOfApp */
    app: { type: 3, target: 'App' },
    /** metadataOfEntity */
    entity: { type: 4, target: 'Entity' },
    /** metadataOfContentType */
    contentType: { type: 5, target: 'ContentType' },
    /** metadataOfZone */
    zone: { type: 6, target: 'Zone' },
    /** metadataOfCmsObject */
    cmsObject: { type: 10, target: 'CmsObject' },
  },

  /** Loopup type for the metadata, e.g. key=80adb152-efad-4aa4-855e-74c5ef230e1f is keyType=guid */
  keyTypes: {
    guid: 'guid',
    string: 'string',
    number: 'number',
  },

  /** Scopes */
  scopes: {
    /** This is the main schema and the data you usually see is from here */
    default: { name: 'Default', value: '2SexyContent' },
    /** This contains content-types for configuration, settings and resources of the app */
    app: { name: 'System: App', value: '2SexyContent-App' },
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
  },

  pipelineDesigner: {
    outDataSource: {
      className: 'SexyContentTemplate',
      in: ['ListContent', 'Default'],
      name: '2sxc Target (View or API)',
      description: 'The template/script which will show this data',
      visualDesignerData: { Top: 20, Left: 200, Width: 700 }
    },
    defaultPipeline: {
      dataSources: [
        {
          EntityGuid: 'unsaved1',
          PartAssemblyAndType: 'ToSic.Eav.DataSources.IAppRoot, ToSic.Eav.DataSources',
          VisualDesignerData: { Top: 440, Left: 440 }
        }, {
          EntityGuid: 'unsaved2',
          PartAssemblyAndType: 'ToSic.Eav.DataSources.PublishingFilter, ToSic.Eav.DataSources',
          VisualDesignerData: { Top: 300, Left: 440 }
        }, {
          EntityGuid: 'unsaved3',
          PartAssemblyAndType: 'ToSic.Sxc.DataSources.CmsBlock, ToSic.Sxc',
          VisualDesignerData: { Top: 170, Left: 440 }
        }
      ],
      streamWiring: [
        { From: 'unsaved1', Out: 'Default', To: 'unsaved2', In: 'Default' },
        { From: 'unsaved1', Out: 'Drafts', To: 'unsaved2', In: 'Drafts' },
        { From: 'unsaved1', Out: 'Published', To: 'unsaved2', In: 'Published' },
        { From: 'unsaved2', Out: 'Default', To: 'unsaved3', In: 'Default' },
        { From: 'unsaved3', Out: 'ListContent', To: 'Out', In: 'ListContent' },
        { From: 'unsaved3', Out: 'Default', To: 'Out', In: 'Default' }
      ]
    },
    testParameters: '[Demo:Demo]=true',
  },
};
