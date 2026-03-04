import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { classLog } from '../../../../../../../shared/logging';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { PickerPartBaseComponent } from '../picker-part-base';

@Component({
    selector: 'app-picker-text',
    templateUrl: './picker-text.html',
    imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
    ]
})
export class PickerTextComponent extends PickerPartBaseComponent {
  
  log = classLog({PickerTextComponent});

  constructor() { super(); }

  /**
   * Tell the text-input to be multi-line, if the separator is a newline.
   * Otherwise, it will be single-line.
   */
  protected useMultiLine = computedObj('useMultiLine', () => {
    const settings = this.fieldState.settings();
    const separator = settings.Separator;
    const isSeparatorNewLine = separator == '\\n' /* buggy temp double-slash-n */ || separator == '\n' /* correct */;
    return isSeparatorNewLine;
  });
}
