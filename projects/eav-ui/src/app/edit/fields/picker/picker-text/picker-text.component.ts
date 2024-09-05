import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexModule } from '@angular/flex-layout/flex';
import { PickerPartBaseComponent } from '../picker-part-base.component';
import { PickerItem } from '../models/picker-item.model';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { computedObj } from '../../../../shared/signals/signal.utilities';

const logThis = false;
const nameOfThis = 'PickerTextComponent';

@Component({
  selector: 'app-picker-text',
  templateUrl: './picker-text.component.html',
  styleUrls: ['./picker-text.component.scss'],
  standalone: true,
  imports: [
    FlexModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    AsyncPipe,
  ],
})
export class PickerTextComponent extends PickerPartBaseComponent {

  filteredEntities: PickerItem[] = [];

  useMultiLine = computedObj('useMultiLine', () => {
    const settings = this.fieldState.settings();
    const separator = settings.Separator;
    const isSeparatorNewLine = separator == '\\n' /* buggy temp double-slash-n */ || separator == '\n' /* correct */;
    return isSeparatorNewLine;
  });

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  toggleFreeText(disabled: boolean): void {
    if (disabled) return;
    this.pickerData.state.toggleFreeTextMode();
  }
}
