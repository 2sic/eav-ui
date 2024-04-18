import { Component, Input, OnInit } from '@angular/core';
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
  @Input() pickerData: PickerData;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  selectedEntity: PickerItem | null = null;
  selectedEntities: PickerItem[] = [];

  filteredEntities: PickerItem[] = [];
  viewModel$: Observable<EntityPickerTextViewModel>;

  constructor(
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit(): void {
    const state = this.pickerData.state;
    const source = this.pickerData.source;

    const freeTextMode$ = state.freeTextMode$;
    const controlStatus$ = state.controlStatus$;
    const label$ = state.label$;
    const placeholder$ = state.placeholder$;
    const required$ = state.required$;

    const separator$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
      map(settings => settings.Separator),
    );

    this.viewModel$ = combineLatest([
      controlStatus$, freeTextMode$, label$, placeholder$, required$, separator$
    ]).pipe(
      map(([
        controlStatus, freeTextMode, label, placeholder, required, separator,
      ]) => {
        const isSeparatorNewLine = separator == '\\n' /* buggy temp double-slash-n */ || separator == '\n' /* correct */;
        const viewModel: EntityPickerTextViewModel = {
          controlStatus,
          freeTextMode,
          label,
          placeholder,
          required,

          isSeparatorNewLine,
        };
        return viewModel;
      }),
    );
  }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerData.state.toggleFreeTextMode();
  }
}
