import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MetadataService } from './metadata.service';
import { EntitiesService } from './entities.service';
import { Context } from '../../../shared/context/context';
import { Permission } from '../models/permission.model';

@Injectable()
export class PermissionsService {
  private ctName = 'PermissionConfiguration'; // spm Figure this out
  private ctId = 0; // spm Figure this out

  constructor(private metadataService: MetadataService, private entitiesService: EntitiesService, private context: Context) { }

  getAll(targetType: number, keyType: string, contentTypeStaticName: string) {
    return <Observable<Permission[]>>(
      this.metadataService.getMetadata(this.context.appId, targetType, keyType, contentTypeStaticName, this.ctName)
    );
  }

  delete(id: number) {
    return <Observable<null>>this.entitiesService.delete(this.context.appId, this.ctName, id, false);
  }
}
