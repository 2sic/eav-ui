import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-default',
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.EavLocalizationWrapper],
})
export class BooleanDefaultComponent extends BaseComponent<boolean> implements OnInit {

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = combineLatest(this.value$, this.settings$, this.label$).pipe(map(combined => {
      const value = combined[0];
      const settings = combined[1];
      const label = combined[2];
      if (value === true && settings.TitleTrue != null && settings.TitleTrue !== '') {
        return settings.TitleTrue;
      }
      if (value === false && settings.TitleFalse != null && settings.TitleFalse !== '') {
        return settings.TitleFalse;
      }
      return label;
    }));
  }
}
