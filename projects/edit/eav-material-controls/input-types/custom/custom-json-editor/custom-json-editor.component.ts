import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { FieldsSettings2NewService } from '../../../../shared/services/fields-settings2new.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { CustomJsonEditorLogic } from './custom-json-editor-logic';
import { CustomJsonEditorTemplateVars } from './custom-json-editor.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-json-editor',
  templateUrl: './custom-json-editor.component.html',
  styleUrls: ['./custom-json-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class CustomJsonEditorComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<CustomJsonEditorTemplateVars>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettings2NewService: FieldsSettings2NewService,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2NewService);
    CustomJsonEditorLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    const rowCount$ = this.settings$.pipe(map(settings => settings.Rows));

    this.templateVars$ = combineLatest([
      combineLatest([rowCount$, this.placeholder$, this.required$, this.label$]),
      combineLatest([this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [rowCount, placeholder, required, label],
        [disabled, showValidation],
      ]) => {
        const templateVars: CustomJsonEditorTemplateVars = {
          rowCount,
          placeholder,
          required,
          label,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
