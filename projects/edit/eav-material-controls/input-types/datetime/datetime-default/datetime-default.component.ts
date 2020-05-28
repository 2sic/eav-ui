import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { DateTimeAdapter } from '@danielmoncada/angular-datetime-picker';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class DatetimeDefaultComponent extends BaseComponent<string> implements OnInit {
  useTimePicker$: Observable<boolean>;

  constructor(
    eavService: EavService,
    private translate: TranslateService,
    private dateAdapter: DateAdapter<any>,
    private dateTimeAdapter: DateTimeAdapter<any>,
  ) {
    super(eavService);
    const currentLang = this.translate.currentLang;
    angularConsoleLog('Datepickers locale:', currentLang);
    this.dateAdapter.setLocale(currentLang);
    this.dateTimeAdapter.setLocale(currentLang);
  }

  ngOnInit() {
    super.ngOnInit();
    this.useTimePicker$ = this.settings$.pipe(map(settings => settings.UseTimePicker));
  }
}
