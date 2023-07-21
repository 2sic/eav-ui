import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { EntityInfo } from '../../../../../../../../../edit-types';
import { GeneralHelpers } from '../../../../../shared/helpers';
import { FieldsSettingsService } from '../../../../../shared/services';
import { GlobalConfigService } from '../../../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../../../builder/fields-builder/field-config-set.model';
import { SelectedEntity } from '../entity-default.models';
import { EntitySearchViewModel } from './entity-default-search.models';

@Component({
  selector: 'app-entity-default-search',
  templateUrl: './entity-default-search.component.html',
  styleUrls: ['./entity-default-search.component.scss'],
})
export class EntityDefaultSearchComponent implements OnInit, OnChanges {
  @ViewChild('autocomplete') autocompleteRef?: ElementRef;

  @Input() config: FieldConfigSet;
  @Input() group: UntypedFormGroup;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() required: boolean;
  @Input() invalid: boolean;
  @Input() touched: boolean;
  @Input() disabled: boolean;
  @Input() freeTextMode: boolean;
  @Input() selectedEntities: SelectedEntity[];
  @Input() availableEntities?: EntityInfo[];
  @Input() disableAddNew: boolean;
  @Input() error: string;

  @Output() private fetchAvailableEntities = new EventEmitter<undefined>();
  @Output() private toggleFreeTextMode = new EventEmitter<undefined>();
  @Output() private addSelected = new EventEmitter<string>();
  @Output() private editEntity = new EventEmitter<{ entityGuid: string, entityId: number }>();

  filteredEntities: EntityInfo[] = [];
  viewModel: Observable<EntitySearchViewModel>;
  private control: AbstractControl;

  constructor(
    private translate: TranslateService,
    private globalConfigService: GlobalConfigService,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit(): void {
    this.control = this.group.controls[this.config.fieldName];

    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();
    const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => ({
        AllowMultiValue: settings.AllowMultiValue,
        EnableCreate: settings.EnableCreate,
        EntityType: settings.EntityType,
        EnableAddExisting: settings.EnableAddExisting,
        EnableTextEntry: settings.EnableTextEntry,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );
    this.viewModel = combineLatest([debugEnabled$, settings$]).pipe(
      map(([debugEnabled, settings]) => {
        const viewModel: EntitySearchViewModel = {
          debugEnabled,
          allowMultiValue: settings.AllowMultiValue,
          enableCreate: settings.EnableCreate,
          entityType: settings.EntityType,
          enableAddExisting: settings.EnableAddExisting,
          enableTextEntry: settings.EnableTextEntry,
        };
        return viewModel;
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableEntities != null) {
      this.filterSelectionList();
    }
  }

  markAsTouched(): void {
    GeneralHelpers.markControlTouched(this.control);
  }

  fetchEntities(): void {
    if (this.availableEntities != null) { return; }
    this.fetchAvailableEntities.emit();
  }

  getPlaceholder(): string {
    if (this.availableEntities == null) {
      return this.translate.instant('Fields.Entity.Loading');
    }
    if (this.availableEntities.length > 0) {
      return this.translate.instant('Fields.Entity.Search');
    }
    if (this.error) {
      return this.error;
    }
    return this.translate.instant('Fields.EntityQuery.QueryNoItems');
  }

  toggleFreeText(): void {
    if (this.disabled) { return; }
    this.toggleFreeTextMode.emit();
  }

  filterSelectionList(): EntityInfo[] {
    if (this.availableEntities == null) { return []; }

    const filter = this.autocompleteRef?.nativeElement.value;
    if (!filter) {
      this.filteredEntities = this.availableEntities;
      return;
    }

    this.filteredEntities = this.availableEntities.filter(option =>
      option.Text
        ? option.Text.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        : option.Value.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
    );
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    const selected: string = event.option.value;
    this.addSelected.emit(selected);
    this.autocompleteRef.nativeElement.value = '';
    this.autocompleteRef.nativeElement.blur();
  }

  insertNull(): void {
    this.addSelected.emit(null);
  }

  isOptionDisabled(value: string): boolean {
    const isSelected = this.selectedEntities.some(entity => entity.value === value);
    return isSelected;
  }

  openNewEntityDialog(): void {
    this.editEntity.emit(null);
  }
}
