import { Component, computed, inject, signal } from '@angular/core';
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
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { RxHelpers } from '../../../../shared/rxJs/rx.helpers';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';

@Component({
  selector: InputTypeConstants.NumberDropdown,
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

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;
  protected config = this.fieldState.config;
  protected controlStatus = this.fieldState.controlStatus;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  protected enableTextEntry = computed(() => this.settings().EnableTextEntry, SignalHelpers.boolEquals);

  dropdownOptions = computed(() => this.settings()._options, { equal: RxHelpers.arraysEqual });

  toggleFreeText = signal<boolean>(false);
  freeTextMode = computed(() => {
    return this.enableTextEntry() ? this.toggleFreeText() : false;
  });

  constructor() {
    NumberDropdownLogic.importMe();
  }

  toggleFreeTextMode(freeTextMode: boolean) {
    if (this.toggleFreeText() !== freeTextMode)
      this.toggleFreeText.set(freeTextMode);
  }
}
