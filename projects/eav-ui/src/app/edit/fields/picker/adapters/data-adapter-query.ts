import { DataSourceQuery } from "../data-sources/data-source-query";
import { DataAdapterEntityBase } from "./data-adapter-entity-base";
import { Injectable, computed, untracked } from '@angular/core';
import { placeholderPickerItem } from '../models/picker-item.model';
import { FieldMask } from '../../../shared/helpers/field-mask.helper';
import { transient } from '../../../../core/transient';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';

const logThis = false;
const logName = 'PickerQuerySourceAdapter';

@Injectable()
export class DataAdapterQuery extends DataAdapterEntityBase {
  protected dataSourceEntityOrQuery = transient(DataSourceQuery);

  constructor() {
    super(new EavLogger(logName, logThis));
  }

  /** Url Parameters - often mask - from settings; debounced */
  private urlParametersSettings = computed(() => this.fieldState.settings().UrlParameters, SignalHelpers.stringEquals);

  /** This is a text or mask containing all query parameters. Since it's a mask, it can also contain values from the current item */
  private queryParamsMask = computed(() => {
    const urlParameters = this.urlParametersSettings();
    // Note: this is a bit ugly, not 100% sure if the cleanup will happen as needed
    let fieldMask: FieldMask;
    untracked(() => {
      fieldMask = transient(FieldMask, this.injector).init(logName, urlParameters, true);
    });
    return fieldMask;
  });

  init(callerName: string): void {
    super.init(callerName);
    // #cleanUpCaAugust2024
    // this.setupFlushOnSettingsChange();
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dataSourceEntityOrQuery.setParams(this.queryParamsMask()?.process());
  }

  fetchItems(): void {
    this.log.a('fetchItems');
    this.dataSourceEntityOrQuery.setParams(this.queryParamsMask()?.process());
    // note: it's kind of hard to produce this error, because the config won't save without a query
    if (!this.fieldState.settings().Query) {
      const errors = [placeholderPickerItem(this.translate, 'Fields.Picker.QueryNotDefined')];
      this.errorOptions.set(errors);
      return;
    }
    this.dataSourceEntityOrQuery.triggerGetAll();
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
