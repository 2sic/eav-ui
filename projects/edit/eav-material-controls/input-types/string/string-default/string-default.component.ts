import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { StringDefaultLogic } from './string-default-logic';
import { StringDefaultTemplateVars } from './string-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringDefaultComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<StringDefaultTemplateVars>;
  counter = 1;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
    StringDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    const rowCount$ = this.settings$.pipe(map(settings => settings.RowCount), distinctUntilChanged());

    this.templateVars$ = combineLatest([
      combineLatest([rowCount$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [rowCount, label, placeholder, required],
        [disabled, touched],
      ]) => {
        const templateVars: StringDefaultTemplateVars = {
          rowCount,
          label,
          placeholder,
          required,
          disabled,
          touched,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  getCounter() {
    return this.counter++;
  }
}
