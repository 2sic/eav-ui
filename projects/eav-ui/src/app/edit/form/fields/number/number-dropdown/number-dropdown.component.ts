import { Component, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { StringDropdownComponent } from '../../string/string-dropdown/string-dropdown.component';
import { NumberDropdownLogic } from './number-dropdown-logic';

@Component({
  selector: InputTypeConstants.NumberDropdown,
  templateUrl: '../../string/string-dropdown/string-dropdown.component.html',
  styleUrls: ['../../string/string-dropdown/string-dropdown.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class NumberDropdownComponent extends StringDropdownComponent implements OnInit, OnDestroy {

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    this.type = 'number';
    NumberDropdownLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
