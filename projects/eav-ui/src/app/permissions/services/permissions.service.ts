import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Of, transient } from '../../core';
import { eavConstants, MetadataKeyTypes } from '../../shared/constants/eav.constants';
import { EntityEditService } from '../../shared/services/entity-edit.service';
import { Permission } from '../models/permission.model';
import { MetadataService } from './metadata.service';

@Injectable()
export class PermissionsService {

  private metadataService = transient(MetadataService);

  private entitiesService = transient(EntityEditService);

  getAll(targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string): Observable<Permission[]> {
    return this.metadataService.getMetadata(targetType, keyType, key, eavConstants.contentTypes.permissions).pipe(
      map(metadata => metadata.Items as Permission[]),
    );
  }

  delete(id: number) {
    return this.entitiesService.delete(eavConstants.contentTypes.permissions, id, false);
  }
}
