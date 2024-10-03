import { Injectable } from '@angular/core';
import { transient } from '../../../../../../../core/transient';
import { classLog } from '../../../../shared/logging';
import { FieldMask } from '../../../shared/helpers/field-mask.helper';
import { DataSourceQuery } from "../data-sources/data-source-query";
import { PickerItemFactory } from '../models/picker-item.model';
import { DataAdapterBase } from './data-adapter-base';
import { DataAdapterEntityBase } from "./data-adapter-entity-base";

@Injectable()
export class DataAdapterQuery extends DataAdapterEntityBase {

  log = classLog({DataAdapterQuery}, DataAdapterBase.logSpecs);

  protected dataSourceRaw = transient(DataSourceQuery);

  constructor() { super(); }

  /**
   * Url Parameters - often mask - from settings
   * This is a text or mask containing all query parameters.
   * Since it's a mask, it can also contain values from the current item
   */
  #paramsMaskLazy = transient(FieldMask).initSignal(this.log.name, this.fieldState.setting('UrlParameters'));

  override syncParams(): void {
    this.dataSourceRaw.setParams(this.#paramsMaskLazy?.result());
  }

  fetchItems(): void {
    const l = this.log.fnIfInList('fetchItems', 'fields', this.name);
    this.syncParams();
    // note: it's kind of hard to produce this error, because the config won't save without a query
    if (!this.fieldState.settings().Query) {
      const errors = [PickerItemFactory.placeholder(this.translate, 'Fields.Picker.QueryNotDefined')];
      this.errorOptions.set(errors);
      return;
    }
    this.dataSourceRaw.triggerGetAll();
  }

  // 2024-06-18 2dm enhanced, but I'm not sure if it's even relevant, so I'll disable for now
  // #cleanUpCaAugust2024
  // /**
  //  * TODO: it's a bit unclear what this is for.
  //  * 2024-04-29 2dm I believe it should flush the optionsOrHints$ when the settings change.
  //  * ...but I'm not quite sure how they would ever change at runtime.
  //  * Probably when configuring a new query where the stream is from a mask...
  //  */
  // setupFlushOnSettingsChange(): void {
  //   this.log.add(`flushAvailableEntities, isStringQuery: ${this.isStringQuery}`);

  //   const isStringQuery = this.isStringQuery;
  //   function getPartsToCompareFromSettings(settings: FieldSettings) {
  //     return isStringQuery
  //       ? {
  //           value: settings.Value,
  //           label: settings.Label,
  //         }
  //       : {
  //           Query: settings.Query,
  //           StreamName: settings.StreamName,
  //         };
  //   }
  //   let previous = getPartsToCompareFromSettings(this.settings());
  //   runInInjectionContext(this.injector, () => {
  //     effect(() => {
  //       const settings = this.settings();
  //       const current = getPartsToCompareFromSettings(settings);
  //       if (RxHelpers.objectsEqual(previous, current))
  //         return;
  //       this.log.add('flushing optionsOrHints$');
  //       this.optionsOrHints$.next(null);
  //       previous = current;
  //     }, { allowSignalWrites: true /* necessary because we're changing something */ });
  //   });
  // }
}

/* Old code, keep for now, not sure if it's actually relevant */


// /**
//  * TODO: it's a bit unclear what this is for.
//  * 2024-04-29 2dm I believe it should flush the optionsOrHints$ when the settings change.
//  * ...but I'm not quite sure how they would ever change at runtime.
//  */
// flushAvailableEntities(): void {
//   this.log.add(`flushAvailableEntities, isStringQuery: ${this.isStringQuery}`);
//   if (!this.isStringQuery) {
//     this.subscriptions.add(
//       this.settings$.pipe(
//         map(settings => ({
//           Query: settings.Query,
//           StreamName: settings.StreamName,
//         })),
//         distinctUntilChanged(RxHelpers.objectsEqual),
//       ).subscribe(() => {
//         this.optionsOrHints$.next(null);
//       })
//     );
//   } else {
//     this.subscriptions.add(
//       this.settings$.pipe(
//         map(settings => ({
//           value: settings.Value,
//           label: settings.Label,
//         })),
//         distinctUntilChanged(RxHelpers.objectsEqual),
//       ).subscribe(() => {
//         this.optionsOrHints$.next(null);
//       })
//     );
//   }
// }
