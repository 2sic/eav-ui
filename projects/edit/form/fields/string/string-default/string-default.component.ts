import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { StringDefaultLogic } from './string-default-logic';
import { StringDefaultTemplateVars } from './string-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.scss'],
})
@FieldMetadata({
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
    const settings$ = this.settings$.pipe(
      map(settings => ({
        InputFontFamily: settings.InputFontFamily,
        RowCount: settings.RowCount,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([settings$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [settings],
      ]) => {
        const templateVars: StringDefaultTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          inputFontFamily: settings.InputFontFamily,
          rowCount: settings.RowCount,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
