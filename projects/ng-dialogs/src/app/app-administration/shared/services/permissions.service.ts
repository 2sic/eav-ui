import { Injectable } from '@angular/core';

import { MetadataService } from './metadata.service';
import { EntitiesService } from './entities.service';

@Injectable()
export class PermissionsService {
  private ctName = 'PermissionConfiguration';
  private ctId = 0;

  constructor(
    private metadataService: MetadataService,
    private entitiesService: EntitiesService,
  ) { }

  getAll(appId: number, targetType: number, keyType: string, contentTypeStaticName: string) {
    return this.metadataService.getMetadata(appId, targetType, keyType, contentTypeStaticName, this.ctName);
  }

  delete(appId: number, id: number) {
    return this.entitiesService.delete(appId, this.ctName, id, false);
  }
}
