import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { DateTimeAdapter } from '@danielmoncada/angular-datetime-picker';
import { TranslateService } from '@ngx-translate/core';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class DatetimeDefaultComponent implements Field {
  config: FieldConfigSet;
  group: FormGroup;

  constructor(
    private validationMessagesService: ValidationMessagesService,
    private dateAdapter: DateAdapter<any>, // material date picker
    private dateTimeAdapter: DateTimeAdapter<any>, // owl date picker
    private translate: TranslateService,
  ) {
    // set locale for date pickers (only once because DNN language doesn't get updated during use)
    // if locale is not recognized, falls back to 'en'
    const currentLang = this.translate.currentLang;
    angularConsoleLog('Datepickers locale:', currentLang);
    this.dateAdapter.setLocale(currentLang);
    this.dateTimeAdapter.setLocale(currentLang);
  }

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }
}
