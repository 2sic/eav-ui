import { PickerItem, FieldSettings } from 'projects/edit-types';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { ControlStatus } from '../../../../shared/models';
import { ReorderIndexes } from '../picker-list/picker-list.models';
import { convertArrayToString, convertValueToArray, equalizeSelectedItems } from '../picker.helpers';
import { DeleteEntityProps } from '../models/picker.models';
import { AbstractControl } from '@angular/forms';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { FormConfigService } from '../../../../shared/services';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, Optional } from '@angular/core';
import { PickerComponent } from '../picker.component';
import { PickerDataCacheService } from '../cache/picker-data-cache.service';

const logThis = true;
const dumpSelected = true;
const dumpProperties = false;

@Injectable()
export class PickerStateAdapter extends ServiceBase {
  public disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public freeTextMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public error$: BehaviorSubject<string> = new BehaviorSubject('');

  // TODO: doesn't seem to be in use, but probably should?
  // my guess is it should detect if the open-dialog is shown
  public shouldPickerListBeShown$: Observable<boolean>;
  public selectedItems$: Observable<PickerItem[]>;
  public allowMultiValue$: Observable<boolean>;
  public isDialog$: Observable<boolean>;

  public createEntityTypes: { label: string, guid: string }[] = [];

  constructor(
    public formConfigSvc: FormConfigService,
    entityCacheService: PickerDataCacheService,
    @Optional() logger: EavLogger = null,
  ) {
    super(logger ?? new EavLogger('PickerStateAdapter', logThis));
    this.cacheItems$ = entityCacheService.getEntities$();
  }

  public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null);
  public controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>;
  public isExpanded$: Observable<boolean>;
  public label$: Observable<string>;
  public placeholder$: Observable<string>;
  public required$: Observable<boolean>;
  public cacheItems$: Observable<PickerItem[]>;
  public control: AbstractControl;
  private focusOnSearchComponent: () => void;

  public attachToComponent(component: PickerComponent): this  {
    this.log.a('setupFromComponent');
    this.log.inherit(component.log);
    return this.attachDependencies(
      component.settings$,
      component.config,
      component.controlStatus$,
      component.editRoutingService.isExpanded$(component.config.index, component.config.entityGuid),
      component.label$,
      component.placeholder$,
      component.required$,
      component.control,
      () => component.focusOnSearchComponent,
    );
  }

  private attachDependencies(
    settings$: BehaviorSubject<FieldSettings>,
    config: FieldConfigSet,
    controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>,
    isExpanded$: Observable<boolean>,
    label$: Observable<string>,
    placeholder$: Observable<string>,
    required$: Observable<boolean>,
    control: AbstractControl,
    focusOnSearchComponent: () => void,
  ): this {
    this.log.a('setupShared');
    this.settings$ = settings$;
    this.controlStatus$ = controlStatus$;
    this.isExpanded$ = isExpanded$;
    this.label$ = label$;
    this.placeholder$ = placeholder$;
    this.required$ = required$;
    this.control = control;
    this.focusOnSearchComponent = focusOnSearchComponent;
    return this;
  }


  init(callerName: string) {
    this.log.a('init from ' + callerName);
    const logSelected = this.log.rxTap('selectedItems$', {enabled: true});
    const logCtlSelected = logSelected.rxTap('controlStatus$', {enabled: true});
    this.selectedItems$ = combineLatest([
      this.controlStatus$.pipe(
        logCtlSelected.pipe(),
        map(controlStatus => controlStatus.value),
        distinctUntilChanged(),
        logCtlSelected.distinctUntilChanged(),
      ),
      this.settings$.pipe(
        tap(settings => {
          // TODO: this looks bad - side-effect in observable
          const types = settings.CreateTypes;
          this.createEntityTypes = types
            ? types
                // use either \n or , as delimiter
                .split(types.indexOf('\n') > -1 ? '\n' : ',')
                .map((guid: string) => ({ label: null, guid }))
            : [];
        }),
        map(settings => ({
          Separator: settings.Separator,
          Options: settings._options,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      logSelected.start(),
      map(([value, settings]) =>
        equalizeSelectedItems(value, settings.Separator, settings.Options)
      ),
      logSelected.end(),
    );

    this.allowMultiValue$ = this.settings$.pipe(
      map(settings => settings.AllowMultiValue),
      distinctUntilChanged()
    );

    this.isDialog$ = this.settings$.pipe(
      map(settings => settings._isDialog),
      distinctUntilChanged()
    );

    this.shouldPickerListBeShown$ = combineLatest([
      this.freeTextMode$,
      this.isExpanded$,
      this.allowMultiValue$,
      this.selectedItems$,
    ]).pipe(
      map(([freeTextMode, isExpanded, allowMultiValue, selectedItems]) => {
        return !freeTextMode
          && ((selectedItems.length > 0 && allowMultiValue) || (selectedItems.length > 1 && !allowMultiValue))
          && (!allowMultiValue || (allowMultiValue && isExpanded));
      })
    );

    // log a lot
    if (dumpSelected)
      this.selectedItems$.subscribe(selItems => this.log.a('selectedItems', selItems));

    if (dumpProperties) {
      this.allowMultiValue$.subscribe(allowMv => this.log.a(`allowMultiValue ${allowMv}`));
      this.isDialog$.subscribe(isDialog => this.log.a(`isDialog ${isDialog}`));
      this.shouldPickerListBeShown$.subscribe(shouldShow => this.log.a(`shouldPickerListBeShown ${shouldShow}`));
    }

  }

  destroy() {
    this.log.a('destroy');
    this.settings$.complete();
    this.controlStatus$.complete();
    this.disableAddNew$.complete();
    this.freeTextMode$.complete();
    this.error$.complete();
  }

  updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    let valueArray: string[] = this.createValueArray();

    switch (action) {
      case 'add':
        const guid = value as string;
        if(this.settings$.value.AllowMultiValue)
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
    GeneralHelpers.patchControlValue(this.control, newValue);

    if (action === 'delete' && !valueArray.length) {
      // move back to component
      setTimeout(() => {
        this.focusOnSearchComponent();
      });
    }
  }

  protected createNewValue(valueArray: string[]): string | string[] {
    return typeof this.control.value === 'string'
      ? convertArrayToString(valueArray, this.settings$.value.Separator)
      : valueArray;
  }

  createValueArray(): string[] {
    if (typeof this.control.value === 'string') {
      return convertValueToArray(this.control.value, this.settings$.value.Separator);
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
    this.freeTextMode$.next(!this.freeTextMode$.value);
  }

  getEntityTypesData(): void {
    if (this.createEntityTypes[0].label) { return; }
    this.createEntityTypes.forEach(entityType => {
      const ct = this.formConfigSvc.settings.ContentTypes.find(ct => ct.Id === entityType.guid || ct.Name == entityType.guid);
      entityType.label = ct?.Name ?? entityType.guid + " (not found)";
      entityType.guid = ct?.Id ?? entityType.guid;
    });
  }
}
