import { Injectable } from '@angular/core';
import { QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { EntityFieldDataSource } from '../data-sources/entity-field-data-source';
import { StringFieldDataSource } from '../data-sources/string-field-data-source';
import { QueryFieldDataSource } from '../data-sources/query-field-data-source';
import { TranslateService } from '@ngx-translate/core';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

@Injectable()
export class FieldDataSourceFactoryService extends ServiceBase {
  constructor(
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private queryService: QueryService,
    private translate: TranslateService,
  ) {
    super(new EavLogger('FieldDataSourceFactoryService', logThis));
  }

  createEntityFieldDataSource(
    settings$: BehaviorSubject<FieldSettings>
  ): EntityFieldDataSource {
    this.logger.add('createEntityFieldDataSource', 'settings$', settings$);
    return new EntityFieldDataSource(
      settings$,
      this.queryService,
      this.entityCacheService,
    );
  }

  createStringFieldDataSource(
    settings$: BehaviorSubject<FieldSettings>
  ): StringFieldDataSource {
    this.logger.add('createStringFieldDataSource', 'settings$', settings$);
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
    this.logger.add('createQueryFieldDataSource', 'settings$', settings$);
    return new QueryFieldDataSource(
      settings$,
      this.queryService,
      this.entityCacheService,
      this.stringQueryCacheService,
      this.translate,
      isStringQuery,
      entityGuid,
      fieldName,
      appId
    );
  }
}
