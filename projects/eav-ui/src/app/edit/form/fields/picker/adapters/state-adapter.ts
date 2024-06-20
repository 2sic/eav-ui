import { PickerItem, FieldSettings } from 'projects/edit-types';
import { combineLatest, map, Observable } from 'rxjs';
import { ControlStatus } from '../../../../shared/models';
import { ReorderIndexes } from '../picker-list/reorder-index.models';
import { convertArrayToString, convertValueToArray, correctStringEmptyValue } from '../picker.helpers';
import { DeleteEntityProps } from '../models/picker.models';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { FormConfigService } from '../../../../shared/services';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, Injector, Optional, Signal, computed, inject, signal } from '@angular/core';
import { PickerComponent } from '../picker.component';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { mapUntilChanged, mapUntilObjChanged } from 'projects/eav-ui/src/app/shared/rxJs/mapUntilChanged';
import { PickerFeatures } from '../picker-features.model';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { toObservable } from '@angular/core/rxjs-interop';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

const logThis = false;
const dumpSelected = true;
const dumpProperties = false;
const nameOfThis = 'StateAdapter';

@Injectable()
export class StateAdapter extends ServiceBase {
  public isInFreeTextMode = signal(false, SignalHelpers.boolEquals);

  public features = signal({} as Partial<PickerFeatures>);

  // TODO: doesn't seem to be in use, but probably should?
  // my guess is it should detect if the open-dialog is shown
  // public shouldPickerListBeShown$: Observable<boolean>;

  public selectedItems = signal<PickerItem[]>([]);

  /**  Create list of entity types to create for the (+) button; ATM exclusively used in the new pickers for selecting the source. */
  // public createEntityTypes = signal<{ label: string, guid: string }[]>([]);
  public createEntityTypes = computed(() => {
    const types = this.fieldState.settings().CreateTypes;
    return types
        ? types
            .split(types.indexOf('\n') > -1 ? '\n' : ',')   // use either \n or , as delimiter
            .map((guid: string) => ({ label: null, guid }))
        : []
  }, { equal: RxHelpers.arraysEqual });

  public formConfigSvc = inject(FormConfigService);

  private fieldState = inject(FieldState);
  protected readonly settings = this.fieldState.settings;
  public controlStatus: Signal<ControlStatus<string | string[]>>;
  public basics = this.fieldState.basics;

  private injector = inject(Injector);

  constructor(
    @Optional() logger: EavLogger = null,
  ) {
    super(logger ?? new EavLogger(nameOfThis, logThis));

    // experimental logging
    // effect(() => {
    //   var settings = this.settings();
    //   console.log('2dm settings changed', settings);
    // });
  }

  // todo: make signal, if useful
  // private isExpanded$: Observable<boolean>;
  
  private focusOnSearchComponent: () => void;

  public attachToComponent(component: PickerComponent): this  {
    this.log.a('attachToComponent');
    this.log.inherit(component.log);

    const fs = this.fieldState;
    this.controlStatus = fs.controlStatus as Signal<ControlStatus<string | string[]>>;
    this.focusOnSearchComponent = component.focusOnSearchComponent;

    return this;
  }

  init(callerName: string) {
    this.log.a('init from ' + callerName);

    const logSelected = this.log.rxTap('selectedItems$', {enabled: true});
    const logCtlSelected = logSelected.rxTap('controlStatus$', {enabled: true});

    const controlStatus$ = toObservable(this.controlStatus, { injector: this.injector });
    const selectedItems$ = combineLatest([
      controlStatus$.pipe(
        logCtlSelected.pipe(),
        mapUntilChanged(controlStatus => controlStatus.value),
        logCtlSelected.distinctUntilChanged(),
      ),
      this.fieldState.settings$.pipe(mapUntilObjChanged(settings => ({
        Separator: settings.Separator,
        Options: settings._options,
      }))),
    ]).pipe(
      logSelected.start(),
      map(([controlValue, settings]) =>
        correctStringEmptyValue(controlValue, settings.Separator, settings.Options)
      ),
      logSelected.end(),
    );

    
    // Temp centralize logic if pickerList should show, but not in use yet.
    // Commented out, till we need it, then refactor to signals
    // var allowMultiValue$ = this.settings$.pipe(mapUntilChanged(settings => settings.AllowMultiValue));
    // this.shouldPickerListBeShown$ = combineLatest([
    //   this.isExpanded$,
    //   allowMultiValue$,
    //   selectedItems$,
    // ]).pipe(
    //   map(([isExpanded, allowMultiValue, selectedItems]) => {
    //     return !this.isInFreeTextMode()
    //       && ((selectedItems.length > 0 && allowMultiValue) || (selectedItems.length > 1 && !allowMultiValue))
    //       && (!allowMultiValue || (allowMultiValue && isExpanded));
    //   })
    // );
    // if (dumpProperties) {
    //   this.shouldPickerListBeShown$.subscribe(shouldShow => this.log.a(`shouldPickerListBeShown ${shouldShow}`));
    // }


    // signal
    this.subscriptions.add(
      selectedItems$.subscribe(this.selectedItems.set)
    );

    // log a lot
    if (dumpSelected)
      selectedItems$.subscribe(selItems => this.log.a('selectedItems', selItems));

  }

  destroy() {
    this.log.a('destroy');
    // don't kill here, as it's reused
    // this.settings$.complete();
    // this.controlStatus$.complete();
  }

  updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    let valueArray: string[] = this.createValueArray();

    switch (action) {
      case 'add':
        const guid = value as string;
        if(this.fieldState.settings().AllowMultiValue)
          valueArray.push(guid);
        else
          valueArray = [guid];
        break;
      case 'delete':
        const index = value as number;
        valueArray.splice(index, 1);
        break;
      case 'reorder':
        const reorderIndexes = value as ReorderIndexes;
        moveItemInArray(valueArray, reorderIndexes.previousIndex, reorderIndexes.currentIndex);
        break;
    }

    const newValue = this.createNewValue(valueArray);
    ControlHelpers.patchControlValue(this.fieldState.control, newValue);

    if (action === 'delete' && !valueArray.length) {
      // move back to component
      setTimeout(() => {
        this.focusOnSearchComponent();
      });
    }
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return typeof this.fieldState.control.value === 'string'
      ? convertArrayToString(valueArray, this.fieldState.settings().Separator)
      : valueArray;
  }

  createValueArray(): string[] {
    const fs = this.fieldState;
    if (typeof fs.control.value === 'string')
      return convertValueToArray(fs.control.value, fs.settings().Separator);
    return [...fs.control.value];
  }

  doAfterDelete(props: DeleteEntityProps) {
    this.updateValue('delete', props.index);
  }

  addSelected(guid: string) { this.updateValue('add', guid); }
  removeSelected(index: number) { this.updateValue('delete', index); }
  reorder(reorderIndexes: ReorderIndexes) { this.updateValue('reorder', reorderIndexes); }

  toggleFreeTextMode(): void {
    this.isInFreeTextMode.update(p => !p);
  }

  getEntityTypesData(): void {
    if (this.createEntityTypes()[0].label) return;
    this.createEntityTypes().forEach(entityType => {
      const ct = this.formConfigSvc.settings.ContentTypes
        .find(ct => ct.Id === entityType.guid || ct.Name == entityType.guid);
      entityType.label = ct?.Name ?? entityType.guid + " (not found)";
      entityType.guid = ct?.Id ?? entityType.guid;
    });
  }
}
