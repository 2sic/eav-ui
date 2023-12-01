import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { PickerPillPreviewViewModel } from './picker-pill-preview.models';
import { EavService, FieldsSettingsService, EditRoutingService } from '../../../../shared/services';
import { BaseFieldComponent } from '../../base/base-field.component';
import { WIPDataSourceItem } from 'projects/edit-types';
import { PickerSourceAdapter } from '../adapters/picker-source-adapter';
import { PickerStateAdapter } from '../adapters/picker-state-adapter';

@Component({
  selector: 'app-picker-pill-preview',
  templateUrl: './picker-pill-preview.component.html',
  styleUrls: ['./picker-pill-preview.component.scss'],
})
export class PickerPillPreviewComponent extends BaseFieldComponent<string | string[]> implements OnInit, OnDestroy {
  @Input() pickerSourceAdapter: PickerSourceAdapter;
  @Input() pickerStateAdapter: PickerStateAdapter;

  templateVars$: Observable<PickerPillPreviewViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const controlStatus$ = this.pickerStateAdapter.controlStatus$;
    const label$ = this.pickerStateAdapter.label$;
    const placeholder$ = this.pickerStateAdapter.placeholder$;
    const required$ = this.pickerStateAdapter.required$;
    const isOpen$ = this.settings$.pipe(map(settings => settings._isDialog), distinctUntilChanged());
    const selectedEntities$ = this.pickerStateAdapter.selectedItems$;

    this.templateVars$ = combineLatest([
      combineLatest([controlStatus$, label$, placeholder$, required$]),
      combineLatest([selectedEntities$, isOpen$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [selectedEntities, isOpen],
      ]) => {
        const templateVars: PickerPillPreviewViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          selectedEntities: selectedEntities?.slice(0, 9) || [],
          entitiesNumber: selectedEntities?.length || 0,
          isOpen,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  trackByFn(index: number, item: WIPDataSourceItem) {
    return item.Value;
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }
}
