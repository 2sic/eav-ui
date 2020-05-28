import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class NumberDefaultComponent extends BaseComponent<number> implements OnInit {
  min$: Observable<number>;
  max$: Observable<number>;

  constructor(eavService: EavService) {
    super(eavService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.min$ = this.settings$.pipe(map(settings => settings.Min));
    this.max$ = this.settings$.pipe(map(settings => settings.Max));
  }
}
