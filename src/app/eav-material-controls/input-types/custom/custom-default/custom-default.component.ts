import { Component } from '@angular/core';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-default',
  templateUrl: './custom-default.component.html',
  styleUrls: ['./custom-default.component.scss']
})
@InputType({
})
export class CustomDefaultComponent {

  constructor() {
    console.log('CustomDefaultComponent constructor called');
  }

}
