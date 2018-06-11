import { Component, } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Helper } from '../../../../shared/helpers/helper';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-url-path',
  templateUrl: './string-url-path.component.html',
  styleUrls: ['./string-url-path.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringUrlPathComponent implements Field {
  config: FieldConfig;
  group: FormGroup;

  enableSlashes = true;

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  finalClean(formControlName: string) {
    const formControlValue = this.group.controls[formControlName].value;
    // const orig = formControl.value;
    const cleaned = Helper.stripNonUrlCharacters(formControlValue, this.enableSlashes, true);
    if (formControlValue !== cleaned) {
      this.group.patchValue({ [formControlName]: cleaned });
    }
  }

  clean(formControlName: string) {
    // const orig = formControl.value;
    const formControlValue = this.group.controls[formControlName].value;
    const cleaned = Helper.stripNonUrlCharacters(formControlValue, this.enableSlashes, false);
    if (formControlValue !== cleaned) {
      this.group.patchValue({ [formControlName]: cleaned });
    }
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }

  // TODO: add mask for other fields !!!
}
