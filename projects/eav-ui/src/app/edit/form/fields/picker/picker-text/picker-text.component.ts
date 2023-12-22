import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PickerItem } from 'projects/edit-types';
import { combineLatest, map, Observable } from 'rxjs';
import { EntityPickerTextTemplateVars } from './picker-text.models';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { PickerData } from '../picker-data';

@Component({
  selector: 'app-picker-text',
  templateUrl: './picker-text.component.html',
  styleUrls: ['./picker-text.component.scss'],
})
export class PickerTextComponent implements OnInit {
  @Input() pickerData: PickerData;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  selectedEntity: PickerItem | null = null;
  selectedEntities: PickerItem[] = [];

  filteredEntities: PickerItem[] = [];
  templateVars$: Observable<EntityPickerTextTemplateVars>;

  constructor() { }

  ngOnInit(): void {
    const state = this.pickerData.state;
    const source = this.pickerData.source;

    const freeTextMode$ = state.freeTextMode$;
    const controlStatus$ = state.controlStatus$;
    const label$ = state.label$;
    const placeholder$ = state.placeholder$;
    const required$ = state.required$;

    this.templateVars$ = combineLatest([
      controlStatus$, freeTextMode$, label$, placeholder$, required$
    ]).pipe(
      map(([
        controlStatus, freeTextMode, label, placeholder, required
      ]) => {
        const templateVars: EntityPickerTextTemplateVars = {
          controlStatus,
          freeTextMode,
          label,
          placeholder,
          required,
        };
        return templateVars;
      }),
    );
  }

  toggleFreeText(disabled: boolean): void {
    if (disabled) { return; }
    this.pickerData.state.toggleFreeTextMode();
  }
}
