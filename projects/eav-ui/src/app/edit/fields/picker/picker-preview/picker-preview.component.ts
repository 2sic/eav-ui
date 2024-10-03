import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { classLog } from '../../../../shared/logging';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { PickerCheckboxesComponent } from '../picker-checkboxes/picker-checkboxes.component';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { PickerPillsComponent } from '../picker-pills/picker-pills.component';
import { PickerRadioComponent } from '../picker-radio/picker-radio.component';
import { PickerSearchComponent } from '../picker-search/picker-search.component';
import { PickerTextToggleComponent } from '../picker-text-toggle/picker-text-toggle.component';
import { PickerTextComponent } from '../picker-text/picker-text.component';

@Component({
  selector: 'app-picker-preview',
  templateUrl: './picker-preview.component.html',
  styleUrls: ['./picker-preview.component.scss'],
  standalone: true,
  imports: [
    NgTemplateOutlet,
    NgClass,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    TippyDirective,
    PickerPillsComponent,
    PickerTextToggleComponent,
    PickerSearchComponent,
    PickerTextComponent,
    PickerCheckboxesComponent,
    PickerRadioComponent,
    FieldHelperTextComponent,
  ],
})
export class PickerPreviewComponent extends PickerPartBaseComponent {

  log = classLog({ PickerPreviewComponent });

  constructor() { super(); }

  #pickerMode = this.fieldState.setting('PickerDisplayMode');

  mode = computedObj('mode', () => {
    if (this.isInFreeTextMode()) return 'text';
    const pdm = this.#pickerMode();
    switch (pdm) {
      case 'radio': return 'radio';
      case 'checkbox': return 'checkbox';
      case 'auto-inline':
        // TODO: Check if the selected exist in the options, if not, default to text
        const pd = this.fieldState.pickerData;


        // Multi-value should automatically use checkboxes
        if (this.allowMultiValue()) return 'checkbox';
        return 'radio';
      case 'list':
      default:
        if (this.selectedItems().length > 1) return 'pills';
        return 'search';
    }
  });

  skipHelpText = computedObj('helpTextOnTop', () => {
    const mode = this.mode();
    return mode === 'radio' || mode === 'checkbox';
  });

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
