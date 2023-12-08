import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { PickerPillsViewModel } from './picker-pills.models';
import { EavService, FieldsSettingsService, EditRoutingService } from '../../../../shared/services';
import { BaseFieldComponent } from '../../base/base-field.component';
import { PickerItem } from 'projects/edit-types';
import { TranslateService } from '@ngx-translate/core';
import { PickerData } from '../picker-data';

@Component({
  selector: 'app-picker-pills',
  templateUrl: './picker-pills.component.html',
  styleUrls: ['./picker-pills.component.scss'],
})
export class PickerPillsComponent extends BaseFieldComponent<string | string[]> implements OnInit, OnDestroy {
  @Input() pickerData: PickerData;

  viewModel$: Observable<PickerPillsViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
    private translate: TranslateService,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const state = this.pickerData.state;
    const source = this.pickerData.source;

    const controlStatus$ = state.controlStatus$;
    const label$ = state.label$;
    const placeholder$ = state.placeholder$;
    const required$ = state.required$;
    const isOpen$ = this.settings$.pipe(map(settings => settings._isDialog), distinctUntilChanged());
    const selectedItems$ = this.pickerData.selectedItems$;

    this.viewModel$ = combineLatest([
      combineLatest([controlStatus$, label$, placeholder$, required$]),
      combineLatest([selectedItems$, isOpen$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [selectedItems, isOpen],
      ]) => {
        const templateVars: PickerPillsViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          selectedItems: selectedItems?.slice(0, 9) || [],
          itemsNumber: selectedItems?.length || 0,
          isOpen,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  trackByFn(index: number, item: PickerItem) {
    return item.Value;
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }
}
