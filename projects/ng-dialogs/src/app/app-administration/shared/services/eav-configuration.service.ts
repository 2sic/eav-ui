import { Injectable } from '@angular/core';

@Injectable()
export class EavConfigurationService {
  metadataOfAttribute = 2;
  metadataOfApp = 3;
  metadataOfEntity = 4;
  metadataOfContentType = 5;
  metadataOfZone = 6;
  metadataOfCmsObject = 10;

  contentType = {
    // this is the main schema and the data you usually see is from here
    defaultScope: '2SexyContent',
    // this contains content-types for configuration, settings and resources of the app
    app: '2SexyContent-App',
    // this contains view-definitions, content-types etc.
    cmsSystem: '2SexyContent-System',
    // this contains core EAV data like input-field configurations and similar
    system: 'System',
  };

  constructor() { }
}
