import { PickerItem, messagePickerItem, placeholderPickerItem } from "projects/edit-types";
import { Observable, map, of, startWith } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { QueryStreams } from '../../../../shared/models/query-stream.model';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, computed, inject, signal } from '@angular/core';
import { DataWithLoading } from '../models/data-with-loading';
import { DataSourceEntityQueryBase } from './data-source-entity-query-base';

const logThis = false;
const nameOfThis = 'DataSourceQuery';


// NEXT STEPS
// 1. ✅ create a class for params - so it can be used by both query and entity and not be confusing
// 2. ✅ neutralize the getObservable to be a simple function with same params query/entity
// 3. then move the Overrides into a calculated on the base class
// ... where query/entity override the getObservable
// 4. then clean up the rest
//
// 5. afterwards check all edge cases.

@Injectable()
export class DataSourceQuery extends DataSourceEntityQueryBase {

  private translate = inject(TranslateService);

  constructor() { super(new EavLogger(nameOfThis, logThis)); }

  private appId: number;
  private isForStringField = signal(false);
  private streamName = computed(() => this.settings().StreamName);

  // TODO: SEE IF WE CAN RETRIEVE THESE VALUES DIRECTLY, NOT THROUGH PARAMETERS
  setupQuery(isForStringField: boolean, entityGuid: string, fieldName: string, appId: string): void {
    this.log.a('setupQuery', ['appId', appId, 'isForStringField', isForStringField, 'entityGuid', entityGuid, 'fieldName', fieldName]);

    this.isForStringField.set(isForStringField);
    this.appId = Number(appId);    
  }

  /** Get the data from a query - all or only the ones listed in the guids */
  getFromBackend(params: string, guids: string[], purpose: string)
    : Observable<DataWithLoading<PickerItem[]>> {
    // If the configuration isn't complete, the query can be empty
    const sett = this.settings();
    const streamName = this.streamName();
    const queryName = sett.Query;
    const queryUrl = !!queryName
      ? queryName.includes('/') ? sett.Query : `${sett.Query}/${streamName}`
      : null;

    // If no query, return a dummy item with a message
    let source: Observable<DataWithLoading<QueryStreams>>;
    if (!queryUrl)
      source = of<DataWithLoading<QueryStreams>>({
          data: {
            'Default': [
              {
                Id: -1,
                Guid: null,
                Title: this.translate.instant('Fields.Picker.QueryNotConfigured'),
              },
            ],
          },
          loading: true,
        }
      );
    else {
      // Default case, get the data
      source = this.querySvc
        .getAvailableEntities(queryUrl, params, this.fieldsToRetrieve(this.settings()), guids)
        .pipe(
          map(data => ({ data, loading: false } as DataWithLoading<QueryStreams>)),
          startWith({ data: {} as QueryStreams, loading: true } as DataWithLoading<QueryStreams>)
        );
    }

    return source.pipe(
      map(set => ({
        data: this.transformData(set.data, streamName),
        loading: set.loading,
      } as DataWithLoading<PickerItem[]>)),
    );
  }

  params(params: string): void {
    this.params$.next(params);
  }

  transformData(data: QueryStreams, streamName: string | null): PickerItem[] {
    const valueMustBeGuid = this.isForStringField();
    this.log.a('transformData', ['data', data, 'streamName', streamName]);
    if (!data)
      return [messagePickerItem(this.translate, 'Fields.Picker.QueryErrorNoData')];

    let items: PickerItem[] = [];
    let errors: PickerItem[] = [];
    streamName.split(',').forEach(stream => { 
      if (!data[stream]) {
        errors.push(placeholderPickerItem(this.translate, 'Fields.Picker.QueryStreamNotFound', ' ' + stream));
        return; // TODO: @SDV test if this acts like continue or break
      }
        
      items = items.concat(data[stream].map(entity => this.getMaskHelper().entity2PickerItem({ entity, streamName: stream, mustUseGuid: valueMustBeGuid })));
    });
    return [...errors, ...this.setDisableEdit(items)];
  }

  private setDisableEdit<T extends PickerItem>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => {
        const appId = e.data?.AppId;
        e.noEdit = appId != null && appId !== this.appId;
        e.noDelete = e.noEdit;
      });
    return queryEntities;
  }
}