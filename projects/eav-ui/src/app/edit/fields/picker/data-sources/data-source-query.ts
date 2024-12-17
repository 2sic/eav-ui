import { Injectable, inject } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Observable, map, of } from "rxjs";
import { classLog } from '../../../../shared/logging';
import { QueryStreams } from '../../../../shared/models/query-stream.model';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FormConfigService } from '../../../form/form-config.service';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem, PickerItemFactory } from '../models/picker-item.model';
import { DataSourceEntityBase, logSpecsDataSourceEntityQueryBase } from './data-source-entity-base';

// TODO: NEXT STEPS
// 5. afterwards check all edge cases.
// - EG. not aggressively loading
// - eg changes to data (edits)
// - deletes - NOT QUITE WORKING ATM
// - I believe some kind of clean-up is still necessary...?

@Injectable()
export class DataSourceQuery extends DataSourceEntityBase {

  log = classLog({DataSourceQuery}, logSpecsDataSourceEntityQueryBase);

  #translate = inject(TranslateService);

  constructor() {
    super();
    this.constructorEnd();
  }

  protected formState = inject(FormConfigService);
  #appId = Number(this.formState.config.appId);
  #streamName = computedObj('streamName', () => this.settings().StreamName);

  /**
   * Get the data from a query - all or only the ones listed in the guids
   */
  protected override getFromBackend(params: string, guids: string[], purposeForLog: string): Observable<DataWithLoading<PickerItem[]>> {
    var l = this.log.fnIfInList('getFromBackend', 'fields', this.fieldName, { params, guids }, purposeForLog);
    // If the configuration isn't complete, the query can be empty
    const sets = this.settings();
    const streamName = this.#streamName();
    const queryName = sets.Query;
    const queryUrl = !!queryName
      ? queryName.includes('/') ? sets.Query : `${sets.Query}/${streamName}`
      : null;

    l.a('queryUrl', { queryName, streamName, queryUrl })

    // If no query, return a dummy item with a message
    const source: Observable<DataWithLoading<QueryStreams>> = (() => {
      // If we don't have a query, return a dummy item
      if (!queryUrl) {
        l.a('noQueryUrl - will create dummy item');
        return of<DataWithLoading<QueryStreams>>({
          data: {
            'Default': [
              {
                Id: -1,
                Guid: null,
                Title: this.#translate.instant('Fields.Picker.QueryNotConfigured'),
              },
            ],
          },
          loading: false,
        });
      }

      // We have query (default case), get the data
      l.a('queryUrl for request', { queryUrl });
      return this.querySvc
        .getFromQuery(queryUrl, params, this.fieldsToRetrieve(this.settings()), guids)
        .pipe(
          map(data => ({ data, loading: false } as DataWithLoading<QueryStreams>)),
        );
    })();

    const result = source.pipe(
      map(set => ({
        data: this.#transformData(set.data, streamName),
        loading: set.loading,
      } as DataWithLoading<PickerItem[]>)),
    );
    return l.r(result);
  }


  #transformData(data: QueryStreams, streamName: string | null): PickerItem[] {
    
    const l = this.log.fn('transformData', { data, streamName });
    if (!data)
      return l.r([PickerItemFactory.message(this.#translate, 'Fields.Picker.QueryErrorNoData')], 'data is null');
    
    // Behavior changes a bit if the query is meant to supply data for string-inputs
    // ...mainly because the value is allowed to be any field, not just the Guid.
    const inputSpecs = this.fieldState.config.inputTypeSpecs;
    const valueMustUseGuid = inputSpecs.mustUseGuid;
    const streamNames = streamName.split(',');
    l.values({ inputType: inputSpecs.inputType, valueMustUseGuid, streamNames });

    // If expected streams are missing, create placeholders
    const errors = streamNames
      .filter(streamName => !data[streamName])
      .map(streamName => PickerItemFactory.placeholder(this.#translate, 'Fields.Picker.QueryStreamNotFound', ' ' + streamName));

    // Create the items
    const maskHelper = this.createMaskHelper();
    const items = streamNames
      .filter(streamName => data[streamName])
      .reduce((acc, streamName) => {
        const converted = data[streamName]
          .map(entity => maskHelper.data2PickerItem({ entity, streamName, valueMustUseGuid, valueDefaultsToGuid: true }));
        return acc.concat(converted);
      }, []);

    // Set read-only flags on items from other apps
    const itemsMaybeReadOnly = this.#setDisableEdit(items);

    // Merge errors and items
    return l.r([...errors, ...itemsMaybeReadOnly]);
  }

  #setDisableEdit<T extends PickerItem>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => {
        const appId = e.entity?.AppId;
        e.noEdit = appId != null && appId !== this.#appId;
        e.noDelete = e.noEdit;
      });
    return queryEntities;
  }
}
