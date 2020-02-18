import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MetadataService } from './metadata.service';
import { EntitiesService } from './entities.service';
import { Context } from '../../../shared/context/context';
import { Permission } from '../models/permission.model';
import { eavConfiguration } from './eav-configuration.service';

@Injectable()
export class PermissionsService {
  private ctId = 0; // spm Figure this out

  constructor(private metadataService: MetadataService, private entitiesService: EntitiesService, private context: Context) { }

  getAll(targetType: number, keyType: string, contentTypeStaticName: string) {
    return <Observable<Permission[]>>(
      this.metadataService.getMetadata(
        this.context.appId,
        targetType,
        keyType,
        contentTypeStaticName,
        eavConfiguration.contentType.permissions,
      )
    );
  }

  delete(id: number) {
    return <Observable<null>>this.entitiesService.delete(this.context.appId, eavConfiguration.contentType.permissions, id, false);
  }
}
