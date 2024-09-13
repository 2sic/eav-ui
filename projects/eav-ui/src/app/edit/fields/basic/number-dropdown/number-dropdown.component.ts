import { Component, inject } from '@angular/core';
import { NumberDropdownLogic } from './number-dropdown-logic';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';

@Component({
  selector: InputTypeCatalog.NumberDropdown,
  templateUrl: './number-dropdown.component.html',
  styleUrls: ['./number-dropdown.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    NgClass,
    ExtendedModule,
    MatIconModule,
    FieldHelperTextComponent,
    TranslateModule,
    TippyDirective,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class NumberDropdownComponent {

  #fieldState = inject(FieldState) as FieldState<number>;

  constructor() {
    NumberDropdownLogic.importMe();
  }

  protected group = this.#fieldState.group;
  protected config = this.#fieldState.config;
  protected ui = this.#fieldState.ui;

  // #settings = this.#fieldState.settings;
  protected basics = this.#fieldState.basics;

  // protected enableTextEntry = computedObj('enableTextEntry', () => this.#settings().EnableTextEntry);
  protected enableTextEntry = this.#fieldState.setting('EnableTextEntry');

  // protected dropdownOptions = computedObj('_options', () => this.#settings()._options);
  protected dropdownOptions = this.#fieldState.setting('_options');

  protected toggleFreeText = signalObj<boolean>('toggleFreeText', false);
  protected freeTextMode = computedObj('freeTextMode', () => this.enableTextEntry() ? this.toggleFreeText() : false);
}
