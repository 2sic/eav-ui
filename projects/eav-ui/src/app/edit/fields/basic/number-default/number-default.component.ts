import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { NumberDefaultLogic } from './number-default-logic';

@Component({
    selector: InputTypeCatalog.NumberDefault,
    templateUrl: './number-default.component.html',
    imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        FieldHelperTextComponent,
        AsyncPipe,
    ]
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class NumberDefaultComponent {

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;
  protected config = this.fieldState.config;

  protected basics = this.fieldState.basics;

  protected min = this.fieldState.settingExt('Min');
  protected max = this.fieldState.settingExt('Max');

  constructor() {
    NumberDefaultLogic.importMe();
  }

}
