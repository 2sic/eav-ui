import { Component, ChangeDetectionStrategy } from '@angular/core';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';

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
  constructor(eavService: EavService) {
    super(eavService);
  }
}
