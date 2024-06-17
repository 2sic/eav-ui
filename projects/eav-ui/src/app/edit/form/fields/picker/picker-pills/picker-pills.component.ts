import { Component, OnDestroy, OnInit, computed, input } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { PickerPillsViewModel } from './picker-pills.models';
import { EditRoutingService } from '../../../../shared/services';
import { BaseFieldComponent } from '../../base/base-field.component';
import { PickerItem } from 'projects/edit-types';
import { PickerData } from '../picker-data';
import { MatListModule } from '@angular/material/list';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BaseComponent } from 'projects/eav-ui/src/app/shared/components/base.component';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { FormGroup } from '@angular/forms';
import { PickerPartBaseComponent } from '../picker-part-base.component';

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
export class PickerPillsComponent extends PickerPartBaseComponent /* BaseFieldComponent<string | string[]> */ implements OnInit, OnDestroy {
  // pickerData = input.required<PickerData>();

  // /** Field Configuration */
  // config = input.required<FieldConfigSet>();

  // /** Form Group */
  // group = input.required<FormGroup>();

  viewModel$: Observable<PickerPillsViewModel>;

  // /** Label and other basics to show from the picker data. Is not auto-attached, since it's not the initial/top-level component. */
  // basics = computed(() => this.pickerData().state.basics());

  enableTextEntry = computed(() => this.pickerData().state.settings().EnableTextEntry);

  // selectedItems = computed(() => this.pickerData().selectedItemsSig());

  itemCount = computed(() => this.selectedItems().length);

  // controlStatus = computed(() => this.pickerData().state.controlStatus());

  constructor(
    private editRoutingService: EditRoutingService,
  ) {
    super();
  }

  ngOnInit(): void {
    const pd = this.pickerData();
    const state = pd.state;

    const controlStatus$ = state.controlStatus$;
    // const selectedItems$ = pd.selectedItems$;
    // const settings$ = state.settings$;

    this.viewModel$ = combineLatest([
      controlStatus$, 
      // selectedItems$,
      // settings$
    ]).pipe(
      map(([
        controlStatus,
        // selectedItems,
        // settings,
      ]) => {
        const viewModel: PickerPillsViewModel = {
          controlStatus,
          // selectedItems,
          // itemsNumber: selectedItems?.length || 0,
          // enableTextEntry: settings.EnableTextEntry,
        };
        return viewModel;
      }),
    );
  }

  trackByFn(index: number, item: PickerItem) {
    return item.value;
  }

  expandDialog() {
    const config = this.config();
    if (config.initialDisabled) return;
    this.editRoutingService.expand(true, config.index, config.entityGuid);
  }
}
