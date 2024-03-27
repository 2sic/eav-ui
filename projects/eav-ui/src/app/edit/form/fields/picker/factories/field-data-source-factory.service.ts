import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FieldSettings } from 'projects/edit-types';
import { EntityFieldDataSource } from '../data-sources/entity-field-data-source';
// import { QueryFieldDataSource } from '../data-sources/query-field-data-source';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = true;

// Note: This was refactored by 2dm 2024-03-26
// Goal is to also make the adapters DI compliant
// And then this factory will become obsolete
@Injectable()
export class FieldDataSourceFactoryService extends ServiceBase {
  constructor(private injector: Injector) {
    super(new EavLogger('FieldDataSourceFactoryService', logThis));
  }

  createEntityFieldDataSource(settings$: BehaviorSubject<FieldSettings>): EntityFieldDataSource {
    this.log.add('createEntityFieldDataSource', 'settings$', settings$);
    const ds = this.injector.get(EntityFieldDataSource);
    ds.setup(settings$);
    return ds;
  }


  // createQueryFieldDataSource(
  //   settings$: BehaviorSubject<FieldSettings>,
  //   isStringQuery: boolean,
  //   entityGuid: string,
  //   fieldName: string,
  //   appId: string,
  // ): QueryFieldDataSource {
  //   const ds = this.injector.get(QueryFieldDataSource);
  //   this.log.add('createQueryFieldDataSource', 'ds', ds, 'isStringQuery', isStringQuery, 'entityGuid', entityGuid, 'fieldName', fieldName, 'appId', appId);
  //   ds.setupQuery(
  //     settings$,
  //     isStringQuery,
  //     entityGuid,
  //     fieldName,
  //     appId);
  //   return ds;
  // }
}
