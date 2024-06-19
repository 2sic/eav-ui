import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { NumberDropdownLogic } from './number-dropdown-logic';
import { BaseFieldComponent } from '../../base/base-field.component';
import { TranslateModule } from '@ngx-translate/core';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

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
    SharedComponentsModule,
    MatIconModule,
    FieldHelperTextComponent,
    AsyncPipe,
    TranslateModule,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class NumberDropdownComponent extends BaseFieldComponent<number> implements OnInit, OnDestroy {

  protected fieldState = inject(FieldState);

  protected groupFileState = this.fieldState.group;
  protected configFileState = this.fieldState.config;

  protected settingsFileState = this.fieldState.settings;
  protected basicsFileState = this.fieldState.basics;

  protected enableTextEntry = computed(() => this.settingsFileState().EnableTextEntry, SignalHelpers.boolEquals);

  dropdownOptions = computed(() => this.settingsFileState()._options, { equal: RxHelpers.arraysEqual });

  toggleFreeText = signal<boolean>(false);
  freeTextMode = computed(() => {
    return this.enableTextEntry() ? this.toggleFreeText() : false;
  });

  constructor() {
    super();
    NumberDropdownLogic.importMe();
  }

  toggleFreeTextMode(freeTextMode: boolean) {
    if (this.toggleFreeText() !== freeTextMode)
      this.toggleFreeText.set(freeTextMode);
  }
}
