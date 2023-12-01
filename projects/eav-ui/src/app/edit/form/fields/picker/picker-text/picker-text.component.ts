import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WIPDataSourceItem } from 'projects/edit-types';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { PickerSourceAdapter } from '../adapters/picker-source-adapter';
import { PickerStateAdapter } from '../adapters/picker-state-adapter';
import { EntityPickerTextTemplateVars } from './picker-text.models';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';

@Component({
  selector: 'app-picker-text',
  templateUrl: './picker-text.component.html',
  styleUrls: ['./picker-text.component.scss'],
})
export class PickerTextComponent implements OnInit {
  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  selectedEntity: WIPDataSourceItem | null = null;
  selectedEntities: WIPDataSourceItem[] = [];

  filteredEntities: WIPDataSourceItem[] = [];
  templateVars$: Observable<EntityPickerTextTemplateVars>;

  constructor() { }

  ngOnInit(): void {

    const freeTextMode$ = this.pickerStateAdapter.freeTextMode$;
    const controlStatus$ = this.pickerStateAdapter.controlStatus$;
    const label$ = this.pickerStateAdapter.label$;
    const placeholder$ = this.pickerStateAdapter.placeholder$;
    const required$ = this.pickerStateAdapter.required$;

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
    this.pickerStateAdapter.toggleFreeTextMode();
  }
}
