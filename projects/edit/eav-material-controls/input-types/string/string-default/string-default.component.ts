import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { BaseComponent } from '../../base/base.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringDefaultComponent extends BaseComponent implements OnInit {
  rowCount$: Observable<number>;

  ngOnInit() {
    super.ngOnInit();
    this.rowCount$ = this.settings$.pipe(map(settings => settings.RowCount || 1));
  }
}
