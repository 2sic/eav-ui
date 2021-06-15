import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { ComponentMetadata } from '../../../builder/fields-builder/component-metadata.decorator';
import { BaseComponent } from '../../base/base.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-default',
  templateUrl: './custom-default.component.html',
  styleUrls: ['./custom-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class CustomDefaultComponent extends BaseComponent<null> implements OnInit, OnDestroy {

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
