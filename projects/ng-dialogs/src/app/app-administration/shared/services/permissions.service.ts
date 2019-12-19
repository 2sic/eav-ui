import { Injectable } from '@angular/core';

import { MetadataService } from './metadata.service';

@Injectable()
export class PermissionsService {
  private ctName = 'PermissionConfiguration';
  private ctId = 0;

  constructor(
    private metadataService: MetadataService,
  ) { }

  getAll(appId: number, targetType: number, keyType: string, contentTypeStaticName: string) {
    return this.metadataService.getMetadata(appId, targetType, keyType, contentTypeStaticName, this.ctName);
  }
}
