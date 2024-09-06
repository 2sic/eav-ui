import { Observable, map, of } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { Injectable, inject } from '@angular/core';
import { DataWithLoading } from '../models/data-with-loading';
import { DataSourceEntityQueryBase } from './data-source-entity-query-base';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { FormConfigService } from '../../../state/form-config.service';
import { PickerItem, PickerItemFactory } from '../models/picker-item.model';
import { QueryStreams } from '../../../../shared/models/query-stream.model';
import { computedObj } from '../../../../shared/signals/signal.utilities';

const logSpecs = {
  enabled: false,
  name: 'DataSourceQuery',
  specs: {
    ...DataSourceEntityQueryBase.logSpecs,
  }
};

// TODO: NEXT STEPS
// 5. afterwards check all edge cases.
// - EG. not aggressively loading
// - eg changes to data (edits)
// - deletes - NOT QUITE WORKING ATM
// - I believe some kind of clean-up is still necessary...?

@Injectable()
export class DataSourceQuery extends DataSourceEntityQueryBase {

  #translate = inject(TranslateService);

  constructor() {
    super(new EavLogger(logSpecs));
  }

  protected formState = inject(FormConfigService);
  #appId = Number(this.formState.config.appId);
  #streamName = computedObj('streamName', () => this.settings().StreamName);

  /**
   * Behavior changes a bit if the query is meant to supply data for string-inputs
   * ...mainly because the value is allowed to be any field, not just the Guid.
   */
  #isForStringField = this.fieldState.config.inputTypeSpecs.isString;

  /** Get the data from a query - all or only the ones listed in the guids */
  public override getFromBackend(params: string, guids: string[], purposeForLog: string)
    : Observable<DataWithLoading<PickerItem[]>> {
    var l = this.log.fn('getFromBackend', { params, guids }, purposeForLog);
    // If the configuration isn't complete, the query can be empty
    const sett = this.settings();
    const streamName = this.#streamName();
    const queryName = sett.Query;
    const queryUrl = !!queryName
      ? queryName.includes('/') ? sett.Query : `${sett.Query}/${streamName}`
      : null;

    l.a('queryUrl', { queryName, streamName, queryUrl })

    // If no query, return a dummy item with a message
    let source: Observable<DataWithLoading<QueryStreams>>;
    if (!queryUrl)
      source = of<DataWithLoading<QueryStreams>>({
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
      }
      );
    else {
      // Default case, get the data
      source = this.querySvc
        .getAvailableEntities(queryUrl, params, this.fieldsToRetrieve(this.settings()), guids)
        .pipe(
          map(data => ({ data, loading: false } as DataWithLoading<QueryStreams>)),
        );
    }

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

      items = items.concat(data[stream].map(entity => this.getMaskHelper().entity2PickerItem({
        entity,
        streamName: stream,
        mustUseGuid: valueMustBeGuid
      })));
    });
    return l.r([...errors, ...this.#setDisableEdit(items)]);
  }

  #setDisableEdit<T extends PickerItem>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => {
        const appId = e.data?.AppId;
        e.noEdit = appId != null && appId !== this.#appId;
        e.noDelete = e.noEdit;
      });
    return queryEntities;
  }
}
