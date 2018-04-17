import { Component, OnInit, ViewChild, Input, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessages } from '../../../validators/validation-messages';
import { LocalizationHelper } from '../../../../shared/helpers/localization-helper';
import { ScriptLoaderService, ScriptModel } from '../../../../shared/services/script.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-default',
  templateUrl: './custom-default.component.html',
  styleUrls: ['./custom-default.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class CustomDefaultComponent implements Field, OnInit, AfterViewInit {
  @ViewChild('someVar') elReference: ElementRef;
  @Input() config: FieldConfig;
  group: FormGroup;

  loaded = false;
  template = '';
  constructor(private scriptLoaderService: ScriptLoaderService,
  ) { }
  // private elementRef: ElementRef
  ngOnInit() {


  }

  ngAfterViewInit() {
    const script: ScriptModel = {
      name: 'myScript',
      src: 'assets/script/myScript.js',
      loaded: false,
      template: ''
    };
    // 'assets/script/myScript.html'
    this.scriptLoaderService.load(script).subscribe(s => {
      console.log('loaded ScriptModel: ', s);

      this.loaded = s.loaded;
      if (this.loaded) {
        // this.template = s.template;
        // this.elReference.nativeElement.innerHTML = '<div innerHTML="DivBox(2,2)"></div>';
        // this.elementRef.nativeElement;
        console.log('this.elementRef.nativeElement', this.elReference.nativeElement.innerHTML);
        this.elReference.nativeElement.innerHTML = '<button type="button" onclick="myFunction()">Try it</button>';
        // const tmp = document.createElement('div');

        this.group.controls[this.config.name].patchValue('anteeea');
      }
    });
  }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    return this.group.controls[this.config.name].hasError('required') ? ValidationMessages.requiredMessage(this.config) : '';
  }
}
