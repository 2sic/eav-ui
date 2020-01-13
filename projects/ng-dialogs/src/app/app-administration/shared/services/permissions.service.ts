import { Injectable } from '@angular/core';

import { MetadataService } from './metadata.service';
import { EntitiesService } from './entities.service';
import { Context } from '../../../shared/context/context';

@Injectable()
export class PermissionsService {
  private ctName = 'PermissionConfiguration';
  private ctId = 0;

  constructor(
    private metadataService: MetadataService,
    private entitiesService: EntitiesService,
    private context: Context,
  ) { }

  getAll(targetType: number, keyType: string, contentTypeStaticName: string) {
    return this.metadataService.getMetadata(this.context.appId, targetType, keyType, contentTypeStaticName, this.ctName);
  }

  delete(id: number) {
    return this.entitiesService.delete(this.context.appId, this.ctName, id, false);
  }
}
