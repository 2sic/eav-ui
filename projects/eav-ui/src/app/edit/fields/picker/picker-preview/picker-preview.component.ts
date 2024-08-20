import { Component, OnDestroy, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { PickerTextComponent } from '../picker-text/picker-text.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerTextToggleComponent } from '../picker-text-toggle/picker-text-toggle.component';
import { PickerPillsComponent } from '../picker-pills/picker-pills.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { EditRoutingService } from '../../../shared/services/edit-routing.service';

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
    MatMenuModule,
    MatIconModule,
    FieldHelperTextComponent,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
export class PickerPreviewComponent extends PickerPartBaseComponent implements OnDestroy {

  isInFreeTextMode = computed(() => this.pickerData().state.isInFreeTextMode());

  mySettings = computed(() => {
    const settings = this.fieldState.settings();
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
    const config = this.fieldState.config;
    if (config.initialDisabled) return;
    this.editRoutingService.expand(true, config.index, config.entityGuid);
  }

  getEntityTypesData(): void {
    this.pickerData().state.getEntityTypesData();
  }
}
