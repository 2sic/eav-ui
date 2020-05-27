import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-tristate',
  templateUrl: './boolean-tristate.component.html',
  styleUrls: ['./boolean-tristate.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush // not working because of disabled
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class BooleanTristateComponent extends BaseComponent<boolean | ''> implements OnInit {

  constructor(eavService: EavService) {
    super(eavService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.value$ = this.value$.pipe(map(value => (value === '') ? null : value));
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
      if (value === null && settings.TitleIndeterminate != null && settings.TitleIndeterminate !== '') {
        return settings.TitleIndeterminate;
      }
      return label;
    }));
  }

  toggle() {
    const currentValue: boolean | '' = this.control.value;
    let nextValue: boolean;
    switch (currentValue) {
      case false:
        nextValue = null;
        break;
      case '':
      case null:
        nextValue = true;
        break;
      case true:
        nextValue = false;
        break;
    }
    this.control.patchValue(nextValue);
  }

}
