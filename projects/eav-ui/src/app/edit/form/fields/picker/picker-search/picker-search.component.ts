import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { EntityInfo } from 'projects/edit-types';
import { combineLatest, distinctUntilChanged, map, Observable, Subscription } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../shared/services';
import { GlobalConfigService } from '../../../../shared/store/ngrx-data';
import { SelectedEntity } from '../../entity/entity-default/entity-default.models';
import { PickerSourceAdapter } from '../picker-source-adapter';
import { PickerStateAdapter } from '../picker-state-adapter';
import { EntitySearchViewModel } from './picker-search.models';

@Component({
  selector: 'app-picker-search',
  templateUrl: './picker-search.component.html',
  styleUrls: ['./picker-search.component.scss'],
})
export class PickerSearchComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('autocomplete') autocompleteRef?: ElementRef;

  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;

  private subscriptions: Subscription = new Subscription();
  filteredEntities: EntityInfo[] = [];
  viewModel$: Observable<EntitySearchViewModel>;
  private control: AbstractControl;
  private availableEntities: EntityInfo[] = [];

  constructor(
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit(): void {
    this.control = this.pickerSourceAdapter.group.controls[this.pickerStateAdapter.pickerAdapterBase.config.fieldName];

    const availableEntities$ = this.pickerSourceAdapter.availableEntities$;

    const freeTextMode$ = this.pickerStateAdapter.freeTextMode$;
    const disableAddNew$ = this.pickerStateAdapter.pickerAdapterBase.disableAddNew$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;
    const error$ = this.pickerStateAdapter.error$;
    const selectedEntities$ = this.pickerStateAdapter.selectedEntities$;
    const label$ = this.pickerStateAdapter.label$;
    const placeholder$ = this.pickerStateAdapter.placeholder$;
    const required$ = this.pickerStateAdapter.required$;

    this.subscriptions.add(availableEntities$.subscribe(entities => this.availableEntities = entities));

    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.pickerStateAdapter.pickerAdapterBase.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
        EnableAddExisting: settings.EnableAddExisting,
        EnableTextEntry: settings.EnableTextEntry,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    this.viewModel$ = combineLatest([
      debugEnabled$, settings$, selectedEntities$, availableEntities$, error$,
      controlStatus$, freeTextMode$, disableAddNew$, label$, placeholder$, required$
    ]).pipe(
      map(([
        debugEnabled, settings, selectedEntities, availableEntities, error,
        controlStatus, freeTextMode, disableAddNew, label, placeholder, required
      ]) => {
        const viewModel: EntitySearchViewModel = {
          debugEnabled,
          allowMultiValue: settings.AllowMultiValue,
          enableCreate: settings.EnableCreate,
          entityType: settings.EntityType,
          enableAddExisting: settings.EnableAddExisting,
          enableTextEntry: settings.EnableTextEntry,
          selectedEntities,
          availableEntities,
          error,
          controlStatus,
          freeTextMode,
          disableAddNew,
          label,
          placeholder,
          required
        };
        return viewModel;
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableEntities != null) {
      this.filterSelectionList(this.availableEntities);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  markAsTouched(): void {
    GeneralHelpers.markControlTouched(this.control);
  }

  fetchEntities(availableEntities: EntityInfo[]): void {
    if (availableEntities != null) { return; }
    this.pickerSourceAdapter.fetchAvailableEntities(false);
  }

  getPlaceholder(availableEntities: EntityInfo[], error: string): string {
    if (availableEntities == null) {
      return this.translate.instant('Fields.Entity.Loading');
    }
    if (availableEntities.length > 0) {
      return this.translate.instant('Fields.Entity.Search');
    }
    if (error) {
      return error;
    }
    return this.translate.instant('Fields.EntityQuery.QueryNoItems');
  }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerStateAdapter.toggleFreeTextMode();
  }

  filterSelectionList(availableEntities: EntityInfo[]): EntityInfo[] {
    if (availableEntities == null) { return []; }

    const filter = this.autocompleteRef?.nativeElement.value;
    if (!filter) {
      this.filteredEntities = availableEntities;
      return;
    }

    this.filteredEntities = availableEntities.filter(option =>
      option.Text
        ? option.Text.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        : option.Value.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
    );
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    const selected: string = event.option.value;
    this.pickerStateAdapter.addSelected(selected);
    this.autocompleteRef.nativeElement.value = '';
    this.autocompleteRef.nativeElement.blur();
  }

  insertNull(): void {
    this.pickerStateAdapter.addSelected(null);
  }

  isOptionDisabled(value: string, selectedEntities: SelectedEntity[]): boolean {
    const isSelected = selectedEntities.some(entity => entity.value === value);
    return isSelected;
  }

  openNewEntityDialog(): void {
    this.pickerSourceAdapter.editEntity(null);
  }
}
