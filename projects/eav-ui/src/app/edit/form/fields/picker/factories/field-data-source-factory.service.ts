import { Injectable } from '@angular/core';
import { EntityService, QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { EntityFieldDataSource } from '../data-sources/entity-field-data-source';
import { StringFieldDataSource } from '../data-sources/string-field-data-source';
import { QueryFieldDataSource } from '../data-sources/query-field-data-source';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class FieldDataSourceFactoryService {
  constructor(
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private entityService: EntityService,
    private queryService: QueryService,
    private translate: TranslateService,
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

  createQueryFieldDataSource(
    settings$: BehaviorSubject<FieldSettings>,
    isStringQuery: boolean,
    entityGuid: string,
    fieldName: string,
    appId: string,
  ): QueryFieldDataSource {
    return new QueryFieldDataSource(
      this.queryService,
      this.entityCacheService,
      this.stringQueryCacheService,
      this.translate,
      settings$,
      isStringQuery,
      entityGuid,
      fieldName,
      appId
    );
  }
}
