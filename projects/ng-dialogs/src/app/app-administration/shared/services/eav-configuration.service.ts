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
    defaultScope: '2SexyContent'
  };

  constructor() { }
}
