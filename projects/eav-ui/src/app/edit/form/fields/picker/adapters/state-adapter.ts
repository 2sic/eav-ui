import { PickerItem, FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ControlStatus } from '../../../../shared/models';
import { ReorderIndexes } from '../picker-list/reorder-index.models';
import { convertArrayToString, convertValueToArray, correctStringEmptyValue } from '../picker.helpers';
import { DeleteEntityProps } from '../models/picker.models';
import { AbstractControl } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { FormConfigService } from '../../../../shared/services';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, Optional, Signal, computed, inject, signal } from '@angular/core';
import { PickerComponent } from '../picker.component';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { mapUntilChanged, mapUntilObjChanged } from 'projects/eav-ui/src/app/shared/rxJs/mapUntilChanged';
import { BasicControlSettings } from 'projects/edit-types/src/BasicControlSettings';
import { PickerFeatures } from '../picker-features.model';

const logThis = false;
const dumpSelected = true;
const dumpProperties = false;
const nameOfThis = 'StateAdapter';

@Injectable()
export class StateAdapter extends ServiceBase {
  public isInFreeTextMode = signal(false);

  public features = signal({} as Partial<PickerFeatures>);

  // TODO: doesn't seem to be in use, but probably should?
  // my guess is it should detect if the open-dialog is shown
  public shouldPickerListBeShown$: Observable<boolean>;

  public selectedItems = signal<PickerItem[]>([]);

  public createEntityTypes: { label: string, guid: string }[] = [];

  public formConfigSvc = inject(FormConfigService);

  public readonly settings = signal<FieldSettings>(null);
  public controlStatus: Signal<ControlStatus<string | string[]>>;
  public basics = computed(() => BasicControlSettings.fromSettings(this.settings()));


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

  
  private settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null);
  private controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>;


  private isExpanded$: Observable<boolean>;
  
  public control: AbstractControl;
  private focusOnSearchComponent: () => void;

  public attachToComponent(component: PickerComponent): this  {
    this.log.a('setupFromComponent');
    this.log.inherit(component.log);

    this.settings$ = component.settings$;
    this.subscriptions.add(component.settings$.subscribe(this.settings.set));
    this.controlStatus$ = component.controlStatus$;
    this.controlStatus = component.controlStatus;
    this.isExpanded$ = component.editRoutingService.isExpanded$(component.config.index, component.config.entityGuid);

    this.control = component.control;
    this.focusOnSearchComponent = component.focusOnSearchComponent;

    return this;
  }

  init(callerName: string) {
    this.log.a('init from ' + callerName);

    // Create list of entity types to create for the (+) button
    // ATM exclusively used in the new pickers for selecting the source.
    // todo: enhance some day to also include a better label
    this.subscriptions.add(
      this.settings$.subscribe(settings => {
        const types = settings.CreateTypes;
        this.createEntityTypes = types
          ? types
              .split(types.indexOf('\n') > -1 ? '\n' : ',')   // use either \n or , as delimiter
              .map((guid: string) => ({ label: null, guid }))
          : [];
      })
    );

    const logSelected = this.log.rxTap('selectedItems$', {enabled: true});
    const logCtlSelected = logSelected.rxTap('controlStatus$', {enabled: true});
    const selectedItems$ = combineLatest([
      this.controlStatus$.pipe(
        logCtlSelected.pipe(),
        mapUntilChanged(controlStatus => controlStatus.value),
        logCtlSelected.distinctUntilChanged(),
      ),
      this.settings$.pipe(mapUntilObjChanged(settings => ({
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

    var allowMultiValue$ = this.settings$.pipe(mapUntilChanged(settings => settings.AllowMultiValue));

    this.shouldPickerListBeShown$ = combineLatest([
      this.isExpanded$,
      allowMultiValue$,
      selectedItems$,
    ]).pipe(
      map(([isExpanded, allowMultiValue, selectedItems]) => {
        return !this.isInFreeTextMode()
          && ((selectedItems.length > 0 && allowMultiValue) || (selectedItems.length > 1 && !allowMultiValue))
          && (!allowMultiValue || (allowMultiValue && isExpanded));
      })
    );

    // signal
    this.subscriptions.add(
      selectedItems$.subscribe(this.selectedItems.set)
    );

    // log a lot
    if (dumpSelected)
      selectedItems$.subscribe(selItems => this.log.a('selectedItems', selItems));

    if (dumpProperties) {
      this.shouldPickerListBeShown$.subscribe(shouldShow => this.log.a(`shouldPickerListBeShown ${shouldShow}`));
    }

  }

  destroy() {
    this.log.a('destroy');
    this.settings$.complete();
    this.controlStatus$.complete();
  }

  updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    let valueArray: string[] = this.createValueArray();

    switch (action) {
      case 'add':
        const guid = value as string;
        if(this.settings().AllowMultiValue)
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
    ControlHelpers.patchControlValue(this.control, newValue);

    if (action === 'delete' && !valueArray.length) {
      // move back to component
      setTimeout(() => {
        this.focusOnSearchComponent();
      });
    }
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return typeof this.control.value === 'string'
      ? convertArrayToString(valueArray, this.settings().Separator)
      : valueArray;
  }

  createValueArray(): string[] {
    if (typeof this.control.value === 'string') {
      return convertValueToArray(this.control.value, this.settings().Separator);
    }
    return [...this.control.value];
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
    if (this.createEntityTypes[0].label) return;
    this.createEntityTypes.forEach(entityType => {
      const ct = this.formConfigSvc.settings.ContentTypes
        .find(ct => ct.Id === entityType.guid || ct.Name == entityType.guid);
      entityType.label = ct?.Name ?? entityType.guid + " (not found)";
      entityType.guid = ct?.Id ?? entityType.guid;
    });
  }
}
