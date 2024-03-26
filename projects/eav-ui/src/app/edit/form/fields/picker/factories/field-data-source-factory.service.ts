import { Injectable, Injector } from '@angular/core';
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
import { Router } from '@angular/router';

const logThis = false;

@Injectable()
export class FieldDataSourceFactoryService extends ServiceBase {
  constructor(
    private entityCacheService: EntityCacheService,
    private stringQueryCacheService: StringQueryCacheService,
    private queryService: QueryService,
    private translate: TranslateService,
    private injector: Injector,
  ) {
    super(new EavLogger('FieldDataSourceFactoryService', logThis));
  }

  createEntityFieldDataSource(
    settings$: BehaviorSubject<FieldSettings>
  ): EntityFieldDataSource {
    this.log.add('createEntityFieldDataSource', 'settings$', settings$);
    const ds = new EntityFieldDataSource(
      this.queryService,
      this.entityCacheService,
    );
    ds.setup(settings$);
    return ds;
  }

  createStringFieldDataSource(
    settings$: BehaviorSubject<FieldSettings>
  ): StringFieldDataSource {
    this.log.add('createStringFieldDataSource', 'settings$', settings$);
    const ds = this.injector.get(StringFieldDataSource);
    ds.setup(settings$);
    return ds;
  }

  createQueryFieldDataSource(
    settings$: BehaviorSubject<FieldSettings>,
    isStringQuery: boolean,
    entityGuid: string,
    fieldName: string,
    appId: string,
  ): QueryFieldDataSource {
    this.log.add('createQueryFieldDataSource', 'settings$', settings$);
    const ds = new QueryFieldDataSource(
      // settings$,
      this.queryService,
      this.entityCacheService,
      this.stringQueryCacheService,
      this.translate,
      isStringQuery,
      entityGuid,
      fieldName,
      appId
    );
    ds.setup(settings$);
    return ds;
  }
}
