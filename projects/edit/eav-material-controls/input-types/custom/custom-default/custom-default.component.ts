import { Component, ChangeDetectionStrategy } from '@angular/core';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { BaseComponent } from '../../base/base.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-default',
  templateUrl: './custom-default.component.html',
  styleUrls: ['./custom-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
})
export class CustomDefaultComponent extends BaseComponent<null> {
  constructor() {
    super(null);
  }
}
