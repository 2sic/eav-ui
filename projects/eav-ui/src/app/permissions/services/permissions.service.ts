import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { EntitiesService } from '../../content-items/services/entities.service';
import { eavConstants, MetadataKeyType } from '../../shared/constants/eav.constants';
import { Permission } from '../models/permission.model';
import { MetadataService } from './metadata.service';

@Injectable()
export class PermissionsService {
  constructor(private metadataService: MetadataService, private entitiesService: EntitiesService) { }

  getAll(targetType: number, keyType: MetadataKeyType, key: string): Observable<Permission[]> {
    return this.metadataService.getMetadata(targetType, keyType, key, eavConstants.contentTypes.permissions).pipe(
      map(metadata => metadata.Items as Permission[]),
    );
  }

  delete(id: number) {
    return this.entitiesService.delete(eavConstants.contentTypes.permissions, id, false);
  }
}
