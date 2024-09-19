import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
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
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { classLog } from '../../../../shared/logging';
import { PickerCheckboxesComponent } from '../picker-checkboxes/picker-checkboxes.component';
import { PickerRadioComponent } from '../picker-radio/picker-radio.component';

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
    PickerCheckboxesComponent,
    PickerRadioComponent,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    FieldHelperTextComponent,
    TranslateModule,
    TippyDirective,
  ],
})
export class PickerPreviewComponent extends PickerPartBaseComponent {
  
  log = classLog({PickerPreviewComponent});

  constructor() { super(); }

  pickerDisplayMode = this.fieldState.setting('PickerDisplayMode');

  mySettings = computedObj('mySettings', () => {
    const settings = this.fieldState.settings();
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
  });

}
