import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { StringDropdownLogic } from './string-dropdown-logic';
import { StringDropdownTemplateVars } from './string-dropdown.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown',
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringDropdownComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<StringDropdownTemplateVars>;

  private toggleFreeText$: BehaviorSubject<boolean>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
    StringDropdownLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.toggleFreeText$ = new BehaviorSubject(false);

    const enableTextEntry$ = this.settings$.pipe(map(settings => settings.EnableTextEntry));
    const dropdownOptions$ = this.settings$.pipe(map(settings => settings._options));

    const freeTextMode$ = combineLatest([enableTextEntry$, this.toggleFreeText$]).pipe(
      map(([enableTextEntry, freeTextMode]) => {
        if (!enableTextEntry) { return false; }
        return freeTextMode;
      }),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.label$, this.placeholder$, this.required$, enableTextEntry$, dropdownOptions$, freeTextMode$]),
      combineLatest([this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [label, placeholder, required, enableTextEntry, dropdownOptions, freeTextMode],
        [disabled, showValidation],
      ]) => {
        const templateVars: StringDropdownTemplateVars = {
          label,
          placeholder,
          required,
          enableTextEntry,
          dropdownOptions,
          freeTextMode,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    this.toggleFreeText$.complete();
    super.ngOnDestroy();
  }

  toggleFreeTextMode() {
    this.toggleFreeText$.next(!this.toggleFreeText$.value);
  }
}
