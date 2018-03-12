import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';

import { Helper } from '../../../../shared/helpers/helper';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

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
  // @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);
  config: FieldConfig;
  group: FormGroup;
  enableSlashes = true;

  // ngAfterViewInit() {
  //   if (this.field['__formField__']) {
  //     this.field['__formField__']._control = this.matInput;
  //   }
  // }

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

  // TODO: add mask for other fields !!!
}
