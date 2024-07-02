import { Component, OnDestroy, computed } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout/flex';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { PickerTextComponent } from '../picker-text/picker-text.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerListComponent } from '../picker-list/picker-list.component';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

@Component({
  selector: 'app-picker-dialog',
  templateUrl: './picker-dialog.component.html',
  styleUrls: ['./picker-dialog.component.scss'],
  standalone: true,
  imports: [
    PickerListComponent,
    PickerSearchComponent,
    PickerTextComponent,
    FieldHelperTextComponent,
    FlexModule,
    MatButtonModule,
    SharedComponentsModule,
    MatMenuModule,
    MatIconModule,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
export class PickerDialogComponent extends PickerPartBaseComponent implements OnDestroy {

  protected isInFreeTextMode = computed(() => this.pickerData().state.isInFreeTextMode(), SignalHelpers.boolEquals);

  protected showAddNewEntityButtonInDialog = computed(() => {
    const settings = this.fieldState.settings();
    const showAddNew = !this.isInFreeTextMode()
      && settings.EnableCreate
      && settings.CreateTypes
      && settings.AllowMultiValue;
    return showAddNew;
  }, SignalHelpers.boolEquals);

  constructor() {
    super();
  }

  openNewEntityDialog(entityType: string): void {
    this.pickerData().source.editItem(null, entityType);
  }

  getEntityTypesData(): void {
    this.pickerData().state.getEntityTypesData();
  }
}
