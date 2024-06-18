import { Component, OnDestroy, computed } from '@angular/core';
import { EditRoutingService } from '../../../../shared/services';
import { FieldControlWithSignals } from '../../../builder/fields-builder/field.model';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { PickerTextComponent } from '../picker-text/picker-text.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerTextToggleComponent } from '../picker-text-toggle/picker-text-toggle.component';
import { PickerPillsComponent } from '../picker-pills/picker-pills.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

const logThis = false;
const nameOfThis = 'PickerPreviewComponent';

@Component({
  selector: 'app-picker-preview',
  templateUrl: './picker-preview.component.html',
  styleUrls: ['./picker-preview.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    PickerPillsComponent,
    PickerTextToggleComponent,
    PickerSearchComponent,
    PickerTextComponent,
    MatButtonModule,
    SharedComponentsModule,
    MatMenuModule,
    MatIconModule,
    FieldHelperTextComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
export class PickerPreviewComponent extends PickerPartBaseComponent implements OnDestroy, FieldControlWithSignals {

  isInFreeTextMode = computed(() => this.pickerData().state.isInFreeTextMode());

  mySettings = computed(() => {
    const settings = this.pickerData().state.settings();
    // const leavePlaceForButtons = (settings.CreateTypes && settings.EnableCreate) || settings.AllowMultiValue;
    const showAddNewEntityButton = settings.CreateTypes && settings.EnableCreate;
    const showGoToListDialogButton = settings.AllowMultiValue;
    return {
      allowMultiValue: settings.AllowMultiValue,
      enableEdit: settings.EnableEdit,
      enableCreate: settings.EnableCreate,
      createTypes: settings.CreateTypes,
      enableTextEntry: settings.EnableTextEntry,
      showAddNewEntityButton,
      showGoToListDialogButton,
    };
  }, { equal: RxHelpers.objectsEqual });

  constructor(
    private editRoutingService: EditRoutingService,
  ) {
    super(new EavLogger(nameOfThis, logThis));
  }

  openNewEntityDialog(entityType: string): void {
    this.log.a(`openNewEntityDialog: '${entityType}'`);
    this.pickerData().source.editItem(null, entityType);
  }

  expandDialog() {
    const config = this.config();
    if (config.initialDisabled) { return; }
    this.editRoutingService.expand(true, config.index, config.entityGuid);
  }

  getEntityTypesData(): void {
    this.pickerData().state.getEntityTypesData();
  }
}
