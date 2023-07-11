import { Injectable } from '@angular/core';
import { EntityService } from '../../../shared/services';
import { EntityCacheService } from '../../../shared/store/ngrx-data';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { EntityFieldDataSource } from './entity-field-data-source';
import { StringFieldDataSource } from './string-field-data-source';

@Injectable()
export class FieldDataSourceFactoryService {
  constructor(
    private entityCacheService: EntityCacheService,
    private entityService: EntityService,
  ) { }

  createEntityFieldDataSource(): EntityFieldDataSource { 
    return new EntityFieldDataSource(
      this.entityService,
      this.entityCacheService,
    );
  }

  createStringFieldDataSource(
    settings$: BehaviorSubject<FieldSettings>
  ): StringFieldDataSource {
    return new StringFieldDataSource(
      settings$,
    );
  }
}
