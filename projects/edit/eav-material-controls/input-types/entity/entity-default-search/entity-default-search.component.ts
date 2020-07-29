// tslint:disable-next-line:max-line-length
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnChanges, SimpleChanges, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { FieldSettings } from '../../../../../edit-types';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { SelectedEntity } from '../entity-default/entity-default.models';
import { GlobalConfigurationService } from '../../../../shared/services/global-configuration.service';

@Component({
  selector: 'app-entity-default-search',
  templateUrl: './entity-default-search.component.html',
  styleUrls: ['./entity-default-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDefaultSearchComponent implements OnInit, OnChanges {
  @ViewChild('autocomplete') autocompleteRef: ElementRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  @Input() control: AbstractControl;
  @Input() label: string;
  @Input() placeholder: string;
  @Input() required: boolean;
  @Input() disabled: boolean;
  @Input() freeTextMode: boolean;
  @Input() settings: FieldSettings;
  @Input() error: string;
  @Input() disableAddNew: boolean;
  @Input() selectedEntities: SelectedEntity[];
  @Input() availableEntities: EntityInfo[];

  @Output() toggleFreeTextMode = new EventEmitter<null>();
  @Output() addSelected = new EventEmitter<string>();
  @Output() editEntity = new EventEmitter<string>();

  filteredEntities: EntityInfo[] = [];
  debugEnabled$: Observable<boolean>;

  constructor(private translate: TranslateService, private globalConfigurationService: GlobalConfigurationService) { }

  ngOnInit() {
    this.debugEnabled$ = this.globalConfigurationService.getDebugEnabled();
  }

  ngOnChanges(changes: SimpleChanges) {
    const availableEntities: EntityInfo[] = changes.availableEntities?.currentValue;
    if (availableEntities != null) {
      const filter = this.autocompleteRef?.nativeElement.value || '';
      this.filterSelectionList(filter);
    }
  }

  getPlaceholder() {
    if (this.availableEntities.length) {
      return 'search';
    }
    if (this.error) {
      return this.error;
    }
    return this.translate.instant('Fields.EntityQuery.QueryNoItems');
  }

  toggleFreeText() {
    this.toggleFreeTextMode.emit();
  }

  filterSelectionList(filter: string) {
    if (filter === '') {
      this.filteredEntities = this.availableEntities;
      return;
    }
    this.filteredEntities = this.availableEntities.filter(option =>
      option.Text
        ? option.Text.toLowerCase().includes(filter.toLowerCase())
        : option.Value.toLowerCase().includes(filter.toLowerCase())
    );
  }

  optionSelected(event: MatAutocompleteSelectedEvent) {
    const selected: string = event.option.value;
    this.addSelected.emit(selected);
    this.autocompleteRef.nativeElement.value = '';
    this.autocompleteRef.nativeElement.blur();
  }

  insertNull() {
    this.addSelected.emit(null);
  }

  isOptionDisabled(value: string) {
    const isSelected = !!this.selectedEntities.find(entity => entity.value === value);
    return isSelected;
  }

  openNewEntityDialog() {
    this.editEntity.emit(null);
  }
}
