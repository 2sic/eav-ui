import { combineLatest } from "rxjs";
import { FieldMask } from "../../../../shared/helpers/field-mask.helper";
import { DataSourceQuery } from "../data-sources/data-source-query";
import { DataAdapterEntityBase } from "./data-adapter-entity-base";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { messagePickerItem, placeholderPickerItem } from './data-adapter-base';
import { Injectable, computed, effect, runInInjectionContext, signal, untracked } from '@angular/core';
import { PickerComponent } from '../picker.component';
import { StateAdapter } from './state-adapter';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

const logThis = false;
const logName = 'PickerQuerySourceAdapter';

@Injectable()
export class DataAdapterQuery extends DataAdapterEntityBase {
  /** This is a text or mask containing all query parameters. Since it's a mask, it can also contain values from the current item */
  private queryParamsMask = signal<FieldMask>(null);

  constructor(private dsQuery: DataSourceQuery) {
    super(
      dsQuery,
      new EavLogger(logName, logThis),
    );
  }

  private isStringQuery: boolean;

  override setupFromComponent(component: PickerComponent, state: StateAdapter, useEmpty: boolean): this {
    this.log.a('setupFromComponent');
    super.setupFromComponent(component, state, useEmpty);
    this.isStringQuery = component.isStringQuery;

    const urlParametersSettings = computed(() => this.settings().UrlParameters, SignalHelpers.stringEquals);

    // Note: not quite perfect.
    // If we could get the settings injected (instead of late-added)
    // this could just be a calculated
    // let before = 'not-yet-set'; // make sure it runs once
    runInInjectionContext(this.injector, () => {
      // let count = 100;
      effect(() => {
        // count--;
        // if (count < 0) {
        //   console.error('Error: Could not create contentTypeMask in EntitySourceAdapter');
        //   return;
        // }
        const urlParameters = urlParametersSettings();

        // Don't track these accesses as dependencies!
        untracked(() => {
          this.log.a('init in QuerySourceAdapter, about to create paramsMask')
          this.queryParamsMask.set(new FieldMask(
            urlParameters,
            this.group.controls,
            () => { /* callback not used */ },
            null,
            this.formConfig.config,
            this.config,
            logName, // log name
            true, // overrideLog
          ));
        });
      }, { allowSignalWrites: true /* necessary because the mask has an observable which is set */ });
    });

    return this;
  }

  init(callerName: string): void {
    super.init(callerName);

    this.log.a(`init - isStringQuery: ${this.isStringQuery}`);

    this.dsQuery.setupQuery(
      this.settings,
      this.isStringQuery,
      this.config.entityGuid,
      this.config.fieldName,
      this.formConfig.config.appId,
    );

    // #cleanUpCaAugust2024
    // this.setupFlushOnSettingsChange();

    this.subscriptions.add(combineLatest([
      this.dataSource.data$,
      this.dataSource.loading$,
      this.deletedItemGuids$,
    ]).subscribe({
      next: ([data, loading, deleted]) => {
        const items = data.filter(item => !deleted.some(guid => guid === item.value));
        this.optionsOrHints$.next(loading
          ? [messagePickerItem(this.translate, 'Fields.Picker.Loading'), ...items]
          : items
        );
      },
      error: (error) => {
        this.optionsOrHints$.next([messagePickerItem(this.translate, 'Fields.Picker.QueryError', { error: error.data })]);
      }
    }));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.dsQuery.params(this.queryParamsMask()?.resolve());
  }

  destroy(): void {
    // this.queryParamsMask?.destroy();
    super.destroy();
  }

  fetchItems(): void {
    this.log.a('fetchItems');
    // this.contentType = this.contentTypeMask.resolve();
    // console.warn('2dm content-type', this.contentType);
    // this.entityFieldDataSource.contentType(this.contentType);

    this.dsQuery.params(this.queryParamsMask()?.resolve());
    if (!this.settings().Query) {
      this.optionsOrHints$.next([placeholderPickerItem(this.translate, 'Fields.Picker.QueryNotDefined')]);
      return;
    }

    this.dsQuery.triggerGetAll();
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
  //   this.log.a(`flushAvailableEntities, isStringQuery: ${this.isStringQuery}`);

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
  //       this.log.a('flushing optionsOrHints$');
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
//   this.log.a(`flushAvailableEntities, isStringQuery: ${this.isStringQuery}`);
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