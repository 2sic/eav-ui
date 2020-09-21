import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';

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
export class BooleanDefaultComponent extends BaseComponent<boolean> implements OnInit, OnDestroy {

  constructor(eavService: EavService, validationMessagesService: ValidationMessagesService) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = combineLatest([this.value$, this.settings$, this.label$]).pipe(
      map(([value, settings, label]) => {
        if (value === true && settings.TitleTrue != null && settings.TitleTrue !== '') {
          return settings.TitleTrue;
        }
        if (value === false && settings.TitleFalse != null && settings.TitleFalse !== '') {
          return settings.TitleFalse;
        }
        return label;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
