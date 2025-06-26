import { computed, Injectable, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Of, transient } from '../../../../../core';
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

  getAllLive(targetType: number, keyType: Of<typeof MetadataKeyTypes>, key: string, refresh?: Signal<unknown>,
  ): Signal<Permission[]> {
    const metaDataSignal = this.metadataService.getMetadataLive(refresh, targetType, keyType, key, eavConstants.contentTypes.permissions
    ).value;

    return computed(() => {
      const metaData = metaDataSignal();
      return (metaData?.Items ?? []) as Permission[];
    });
  }

  delete(id: number) {
    return this.entitiesService.delete(eavConstants.contentTypes.permissions, id, false);
  }
}
