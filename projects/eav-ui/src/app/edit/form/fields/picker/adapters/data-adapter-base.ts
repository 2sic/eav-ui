import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { DeleteEntityProps } from '../models/picker.models';
import { DataAdapter } from './data-adapter.interface';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Signal } from '@angular/core';
import { PickerFeatures } from '../picker-features.model';

export abstract class DataAdapterBase extends ServiceBase implements DataAdapter {

  public abstract features: Signal<Partial<PickerFeatures>>;

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   */
  public optionsOrHints$ = new BehaviorSubject<PickerItem[]>(null);

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   * This is a signal, so it can be used in the template. it will _never_ be null.
   * 
   * WIP: Currently based on the observable
   */
  public optionsOrHints = toSignal(this.optionsOrHints$.pipe(map(list => list ?? [])), { initialValue: [] });

  public editEntityGuid$ = new BehaviorSubject<string>(null);

  public deleteCallback: (props: DeleteEntityProps) => void;

  constructor(logSpecs: EavLogger) {
    super(logSpecs);
  }

  protected setup(deleteCallback: (props: DeleteEntityProps) => void): void { 
    this.deleteCallback = deleteCallback;
  }

  init(callerName: string) {
    this.log.a(`init(${callerName})`);
  }

  onAfterViewInit(): void { }

  destroy() {
    this.optionsOrHints$.complete();
    this.editEntityGuid$.complete();
    super.destroy();
  }

  abstract getDataFromSource(): Observable<PickerItem[]>;

  abstract initPrefetch(prefetchGuids: string[]): void;

  abstract forceReloadData(missingData: string[]): void;

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;

  abstract fetchItems(): void;
}

/** Generate a placeholder item to show in the list to show during loading or in case of error */
export function placeholderPickerItem(translate: TranslateService, i18nLabel: string, suffix?: string): PickerItem {
  const item: PickerItem = {
    label: translate.instant(i18nLabel) + (suffix ?? ''),
    value: null,
    notSelectable: true,
    isMessage: true,
    noDelete: true,
    noEdit: true,
  };
  return item;
}

/** Generate a placeholder item to show in the list to show during loading or in case of error */
export function messagePickerItem(translate: TranslateService, i18nLabel: string, params?: object): PickerItem {
  const item: PickerItem = {
    label: translate.instant(i18nLabel, params),
    value: null,
    notSelectable: true,
    isMessage: true,
    noDelete: true,
    noEdit: true,
  };
  return item;
}