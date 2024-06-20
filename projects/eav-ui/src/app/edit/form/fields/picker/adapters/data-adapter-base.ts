import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, map } from 'rxjs';
import { DeleteEntityProps } from '../models/picker.models';
import { DataAdapter } from './data-adapter.interface';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Signal, computed, signal } from '@angular/core';
import { PickerFeatures } from '../picker-features.model';
import { DataSourceBase } from '../data-sources/data-source-base';

export abstract class DataAdapterBase extends ServiceBase implements DataAdapter {

  /** Picker Features of this DataAdapter - must be implemented by every data source to communicate it's features */
  public abstract features: Signal<Partial<PickerFeatures>>;

  /** a signal for data-sources - may not need a signal, if it's unchanging... */
  public dataSource = signal<DataSourceBase>(null satisfies DataSourceBase);

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   */
  protected optionsOrHints$ = new BehaviorSubject<PickerItem[]>(null);

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   * This is a signal, so it can be used in the template. it will _never_ be null.
   * 
   * WIP: Currently based on the observable
   */
  private optionsOrHintsTemp = toSignal(this.optionsOrHints$.pipe(map(list => list ?? [])), { initialValue: [] });
  protected useDataSourceStream = signal(false);
  public optionsOrHints = computed(() => (this.useDataSourceStream() ? this.dataSource().data() : this.optionsOrHintsTemp()) ?? []);

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

  abstract initPrefetch(prefetchGuids: string[]): void;

  abstract forceReloadData(missingData: string[]): void;

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;

  abstract fetchItems(): void;
}
