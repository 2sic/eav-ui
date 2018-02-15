import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';
import { FormControl } from '@angular/forms';
import { Helper } from '../../../../shared/helpers/helper';

@Component({
  selector: 'app-string-url-path',
  templateUrl: './string-url-path.component.html',
  styleUrls: ['./string-url-path.component.css']
})
export class StringUrlPathComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

  enableSlashes = true;

  ngOnInit() {
    super.ngOnInit();
  }

  // ngAfterViewInit() {
  //   if (this.field['__formField__']) {
  //     this.field['__formField__']._control = this.matInput;
  //   }
  // }

  finalClean(formControl: FormControl) {
    const orig = formControl.value;
    const cleaned = Helper.stripNonUrlCharacters(formControl, this.enableSlashes, true);
    if (orig !== cleaned) {
      formControl.setValue(cleaned);
    }
  }

  clean(formControl: FormControl) {
    const orig = formControl.value;
    const cleaned = Helper.stripNonUrlCharacters(formControl, this.enableSlashes, false);
    if (orig !== cleaned) {
      formControl.setValue(cleaned);
    }
  }

  // TODO: add mask for other fields !!!
}
