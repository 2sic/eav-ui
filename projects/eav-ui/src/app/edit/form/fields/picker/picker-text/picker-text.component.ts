import { Component, Input, OnInit, computed, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PickerItem } from 'projects/edit-types';
import { combineLatest, map, Observable } from 'rxjs';
import { EntityPickerTextViewModel } from './picker-text.models';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { PickerData } from '../picker-data';
import { FieldsSettingsService } from '../../../../shared/services/fields-settings.service';
import { AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
  selector: 'app-picker-text',
  templateUrl: './picker-text.component.html',
  styleUrls: ['./picker-text.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    AsyncPipe,
  ],
})
export class PickerTextComponent implements OnInit {
  pickerData = input.required<PickerData>();
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  isInFreeTextMode = computed(() => this.pickerData().state.isInFreeTextMode());

  selectedEntity: PickerItem | null = null;
  selectedEntities: PickerItem[] = [];

  filteredEntities: PickerItem[] = [];
  viewModel$: Observable<EntityPickerTextViewModel>;

  /** Label and other basics to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  basics = computed(() => this.pickerData().state.basics());

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit(): void {
    const state = this.pickerData().state;

    const controlStatus$ = state.controlStatus$;

    const separator$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.Separator),
    );

    this.viewModel$ = combineLatest([
      controlStatus$,
      separator$
    ]).pipe(
      map(([
        controlStatus,
        separator,
      ]) => {
        const isSeparatorNewLine = separator == '\\n' /* buggy temp double-slash-n */ || separator == '\n' /* correct */;
        const viewModel: EntityPickerTextViewModel = {
          controlStatus,
          isSeparatorNewLine,
        };
        return viewModel;
      }),
    );
  }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerData().state.toggleFreeTextMode();
  }
}
