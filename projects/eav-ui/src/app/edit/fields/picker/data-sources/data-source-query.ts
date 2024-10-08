import { Injectable, inject } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { Observable, map, of } from "rxjs";
import { classLog } from '../../../../shared/logging';
import { QueryStreams } from '../../../../shared/models/query-stream.model';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FormConfigService } from '../../../form/form-config.service';
import { DataWithLoading } from '../models/data-with-loading';
import { PickerItem, PickerItemFactory } from '../models/picker-item.model';
import { DataSourceEntityQueryBase, logSpecsDataSourceEntityQueryBase } from './data-source-entity-query-base';

// TODO: NEXT STEPS
// 5. afterwards check all edge cases.
// - EG. not aggressively loading
// - eg changes to data (edits)
// - deletes - NOT QUITE WORKING ATM
// - I believe some kind of clean-up is still necessary...?

@Injectable()
export class DataSourceQuery extends DataSourceEntityQueryBase {

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
   * Behavior changes a bit if the query is meant to supply data for string-inputs
   * ...mainly because the value is allowed to be any field, not just the Guid.
   */
  #isForStringField = this.fieldState.config.inputTypeSpecs.isString;

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
    const valueMustBeGuid = !this.#isForStringField;
    const l = this.log.fn('transformData', { data, streamName, isForStringField: this.#isForStringField });
    if (!data)
      return [PickerItemFactory.message(this.#translate, 'Fields.Picker.QueryErrorNoData')];

    let items: PickerItem[] = [];
    let errors: PickerItem[] = [];
    streamName.split(',').forEach(stream => {
      if (!data[stream]) {
        errors.push(PickerItemFactory.placeholder(this.#translate, 'Fields.Picker.QueryStreamNotFound', ' ' + stream));
        return; // TODO: @SDV test if this acts like continue or break
      }

      items = items.concat(data[stream].map(entity => this.createMaskHelper().data2PickerItem({
        entity,
        streamName: stream,
        valueMustUseGuid: valueMustBeGuid
      })));
    });
    return l.r([...errors, ...this.#setDisableEdit(items)]);
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
