import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { StringDropdownLogic } from './string-dropdown-logic';
import { StringDropdownTemplateVars } from './string-dropdown.models';

@Component({
  selector: InputTypeConstants.StringDropdown,
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringDropdownComponent extends BaseComponent<string | number> implements OnInit, OnDestroy {
  type: 'string' | 'number';
  templateVars$: Observable<StringDropdownTemplateVars>;

  private toggleFreeText$: BehaviorSubject<boolean>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    this.type = 'string';
    StringDropdownLogic.importMe();
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
        const templateVars: StringDropdownTemplateVars = {
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
