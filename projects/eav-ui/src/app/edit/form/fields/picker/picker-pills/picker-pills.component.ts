import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { PickerPillsViewModel } from './picker-pills.models';
import { FormConfigService, FieldsSettingsService, EditRoutingService } from '../../../../shared/services';
import { BaseFieldComponent } from '../../base/base-field.component';
import { PickerItem } from 'projects/edit-types';
import { PickerData } from '../picker-data';
import { MatListModule } from '@angular/material/list';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-picker-pills',
    templateUrl: './picker-pills.component.html',
    styleUrls: ['./picker-pills.component.scss'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        NgClass,
        ExtendedModule,
        MatRippleModule,
        FlexModule,
        MatListModule,
        AsyncPipe,
    ],
})
export class PickerPillsComponent extends BaseFieldComponent<string | string[]> implements OnInit, OnDestroy {
  @Input() pickerData: PickerData;

  viewModel$: Observable<PickerPillsViewModel>;

  constructor(
    fieldsSettingsService: FieldsSettingsService,
    private editRoutingService: EditRoutingService,
  ) {
    super(fieldsSettingsService);
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
    const settings$ = state.settings$;

    this.viewModel$ = combineLatest([
      combineLatest([controlStatus$, label$, placeholder$, required$]),
      combineLatest([selectedItems$, isOpen$, settings$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [selectedItems, isOpen, settings],
      ]) => {
        const viewModel: PickerPillsViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          selectedItems,
          itemsNumber: selectedItems?.length || 0,
          isOpen,
          enableTextEntry: settings.EnableTextEntry,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  trackByFn(index: number, item: PickerItem) {
    return item.value;
  }

  expandDialog() {
    if (this.config.initialDisabled) { return; }
    this.editRoutingService.expand(true, this.config.index, this.config.entityGuid);
  }
}
