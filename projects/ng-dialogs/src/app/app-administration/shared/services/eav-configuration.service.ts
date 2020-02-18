export const eavConfiguration = {
  metadata: {
    metadataOfAttribute: { key: 2, value: 'EAV Field Properties' },
    metadataOfApp: { key: 3, value: 'App' },
    metadataOfEntity: { key: 4, value: 'Entity' },
    metadataOfContentType: { key: 5, value: 'ContentType' },
    metadataOfZone: { key: 6, value: 'Zone' },
    metadataOfCmsObject: { key: 10, value: 'CmsObject' },
  },

  contentType: {
    // this is the main schema and the data you usually see is from here
    defaultScope: '2SexyContent',
    // this contains content-types for configuration, settings and resources of the app
    app: '2SexyContent-App',
    // this contains view-definitions, content-types etc.
    cmsSystem: '2SexyContent-System',
    // this contains core EAV data like input-field configurations and similar
    system: 'System',
    // content type containing app templates (views)
    template: '2SexyContent-Template',
    // content type containing permissions
    permissions: 'PermissionConfiguration',
    // content type containing queries
    query: 'DataPipeline',
  },
};
