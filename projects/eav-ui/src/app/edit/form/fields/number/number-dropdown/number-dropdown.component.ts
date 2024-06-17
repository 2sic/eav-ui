import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { NumberDropdownLogic } from './number-dropdown-logic';
import { BaseFieldComponent } from '../../base/base-field.component';
import { Observable, BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { NumberDropdownViewModel } from './number-dropdown.models';
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
  viewModel$: Observable<NumberDropdownViewModel>;

  private toggleFreeText$: BehaviorSubject<boolean>;

  constructor() {
    super();
    NumberDropdownLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.toggleFreeText$ = new BehaviorSubject(false);

    const enableTextEntry$ = this.settings$.pipe(map(settings => settings.EnableTextEntry), distinctUntilChanged());
    const freeTextMode$ = combineLatest([enableTextEntry$, this.toggleFreeText$]).pipe(
      map(([enableTextEntry, freeTextMode]) => enableTextEntry ? freeTextMode : false),
      distinctUntilChanged(),
    );
    const dropdownOptions$ = this.settings$.pipe(map(settings => settings._options), distinctUntilChanged());

    this.viewModel$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([enableTextEntry$, dropdownOptions$, freeTextMode$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [enableTextEntry, dropdownOptions, freeTextMode],
      ]) => {
        const viewModel: NumberDropdownViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          enableTextEntry,
          dropdownOptions,
          freeTextMode,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    this.toggleFreeText$.complete();
    super.ngOnDestroy();
  }

  toggleFreeTextMode(freeTextMode: boolean) {
    if (this.toggleFreeText$.value !== freeTextMode) {
      this.toggleFreeText$.next(freeTextMode);
    }
  }
}
