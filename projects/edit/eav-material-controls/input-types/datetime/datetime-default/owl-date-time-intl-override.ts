import { OwlDateTimeIntl } from '@danielmoncada/angular-datetime-picker';
import { TranslateService } from '@ngx-translate/core';
import { Inject } from '@angular/core';

export class OwlDateTimeIntlOverride extends OwlDateTimeIntl {
  public cancelBtnLabel: string;
  public setBtnLabel: string;

  constructor(@Inject(TranslateService) private translate: TranslateService) {
    super();

    // https://daniel-projects.firebaseapp.com/owlng/date-time-picker#labels-messages
    this.cancelBtnLabel = this.translate.instant('Fields.DateTime.Cancel');
    this.setBtnLabel = this.translate.instant('Fields.DateTime.Set');
  }
}
