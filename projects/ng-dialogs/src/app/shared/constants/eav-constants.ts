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

  contentType: {
    /** This is the main schema and the data you usually see is from here */
    defaultScope: '2SexyContent',
    /** This contains content-types for configuration, settings and resources of the app */
    app: '2SexyContent-App',
    /** This contains view-definitions, content-types etc. */
    cmsSystem: '2SexyContent-System',
    /** This contains core EAV data like input-field configurations and similar */
    system: 'System',
    /** Content type containing app templates (views) */
    template: '2SexyContent-Template',
    /** Content type containing permissions */
    permissions: 'PermissionConfiguration',
    /** Content type containing queries */
    query: 'DataPipeline',
    /** Content type containing content type metadata (app administration > data > metadata) */
    contentType: 'ContentType',
  },
};
