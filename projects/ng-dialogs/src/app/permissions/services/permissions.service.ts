import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EntitiesService } from '../../content-items/services/entities.service';
import { eavConstants } from '../../shared/constants/eav.constants';
import { Permission } from '../models/permission.model';
import { MetadataService } from './metadata.service';

@Injectable()
export class PermissionsService {
  constructor(private metadataService: MetadataService, private entitiesService: EntitiesService) { }

  getAll(targetType: number, keyType: string, key: string) {
    return this.metadataService.getMetadata(targetType, keyType, key, eavConstants.contentTypes.permissions) as Observable<Permission[]>;
  }

  delete(id: number) {
    return this.entitiesService.delete(eavConstants.contentTypes.permissions, id, false) as Observable<null>;
  }
}
