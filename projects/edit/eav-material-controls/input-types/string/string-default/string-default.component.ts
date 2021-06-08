import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
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

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    StringDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    const fontFamily$ = this.settings$.pipe(map(settings => settings.InputFontFamily), distinctUntilChanged());
    const rowCount$ = this.settings$.pipe(map(settings => settings.RowCount), distinctUntilChanged());

    this.templateVars$ = combineLatest([
      combineLatest([fontFamily$, rowCount$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [fontFamily, rowCount, label, placeholder, required],
        [disabled, touched],
      ]) => {
        const templateVars: StringDefaultTemplateVars = {
          fontFamily,
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
}
