import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-default',
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class BooleanDefaultComponent extends BaseComponent<boolean> implements OnInit {

  constructor(eavService: EavService) {
    super(eavService);
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
