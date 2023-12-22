import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { NumberDropdownLogic } from './number-dropdown-logic';
import { BaseFieldComponent } from '../../base/base-field.component';
import { Observable, BehaviorSubject, combineLatest, distinctUntilChanged, map } from 'rxjs';
import { NumberDropdownTemplateVars } from './number-dropdown.models';

@Component({
  selector: InputTypeConstants.NumberDropdown,
  templateUrl: './number-dropdown.component.html',
  styleUrls: ['./number-dropdown.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class NumberDropdownComponent extends BaseFieldComponent<number> implements OnInit, OnDestroy {
  templateVars$: Observable<NumberDropdownTemplateVars>;

  private toggleFreeText$: BehaviorSubject<boolean>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
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

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([enableTextEntry$, dropdownOptions$, freeTextMode$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [enableTextEntry, dropdownOptions, freeTextMode],
      ]) => {
        const templateVars: NumberDropdownTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          enableTextEntry,
          dropdownOptions,
          freeTextMode,
        };
        return templateVars;
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
