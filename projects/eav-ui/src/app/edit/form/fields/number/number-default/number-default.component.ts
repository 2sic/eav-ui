import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { NumberDefaultViewModel } from './number-default.models';
import { NumberDefaultLogic } from './number-default-logic';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

@Component({
    selector: InputTypeConstants.NumberDefault,
    templateUrl: './number-default.component.html',
    styleUrls: ['./number-default.component.scss'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        FieldHelperTextComponent,
        AsyncPipe,
    ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class NumberDefaultComponent extends BaseFieldComponent<number> implements OnInit, OnDestroy {
  viewModel: Observable<NumberDefaultViewModel>;

  constructor() {
    super();
    NumberDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    const settings$ = this.settings$.pipe(
      map(settings => ({
        Min: settings.Min,
        Max: settings.Max,
      })),
      distinctUntilChanged(RxHelpers.objectsEqual),
    );

    this.viewModel = combineLatest([
      combineLatest([settings$]),
    ]).pipe(
      map(([
        [settings],
      ]) => {
        const viewModel: NumberDefaultViewModel = {
          min: settings.Min,
          max: settings.Max,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
