import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MetadataService } from './metadata.service';
import { EntitiesService } from './entities.service';
import { Permission } from '../models/permission.model';
import { eavConstants } from '../../../shared/constants/eav-constants';

@Injectable()
export class PermissionsService {
  constructor(private metadataService: MetadataService, private entitiesService: EntitiesService) { }

  getAll(targetType: number, keyType: string, key: string) {
    return <Observable<Permission[]>>this.metadataService.getMetadata(targetType, keyType, key, eavConstants.contentTypes.permissions);
  }

  delete(id: number) {
    return <Observable<null>>this.entitiesService.delete(eavConstants.contentTypes.permissions, id, false);
  }
}
