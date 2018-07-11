import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-library',
  templateUrl: './hyperlink-library.component.html',
  styleUrls: ['./hyperlink-library.component.css']
})
@InputType({
  wrapper: ['app-dropzone', 'app-eav-localization-wrapper'],
})
export class HyperlinkLibraryComponent implements Field, OnInit {
  @Input() config: FieldConfig;
  group: FormGroup;

  constructor() { }

  ngOnInit() {
    this.attachAdam();
  }

  private attachAdam() {
    if (this.config.adam) {
      // callbacks - functions called from adam
      this.config.adam.updateCallback = (fileItem) => { };

      // binding for dropzone
      this.config.adam.afterUploadCallback = (fileItem) => { };

      // return value from form
      // this.config.adam.getValueCallback = () =>
    }
  }
}

