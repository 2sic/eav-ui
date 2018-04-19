import { Component, OnInit, ViewChild, Input, ChangeDetectionStrategy, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessages } from '../../../validators/validation-messages';
import { LocalizationHelper } from '../../../../shared/helpers/localization-helper';
import { ScriptLoaderService, ScriptModel } from '../../../../shared/services/script.service';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromEvent';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  @ViewChild('someVar1') elReference1: ElementRef;
  @Input() config: FieldConfig;
  group: FormGroup;

  loaded = false;
  template = '';

  html: SafeHtml;
  constructor(private scriptLoaderService: ScriptLoaderService, private sanitized: DomSanitizer
  ) { }
  // private elementRef: ElementRef
  ngOnInit() {

    Observable.fromEvent(this.elReference1.nativeElement, 'change')
      .do(ev => console.log('test', this.elReference1.nativeElement.value))
      .subscribe(c => {
        this.group.controls[this.config.name].patchValue(this.elReference1.nativeElement.value);
      });
  }

  ngAfterViewInit() {
    // document.getElementById('demo').onchange = 'faca';

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
        console.log('this.elementRef.nativeElement', this.elReference.nativeElement.innerHTML);

        this.elReference.nativeElement.innerHTML = `
        <input id="input1" type="text">
        <input id="input2" type="text">
        <button type="button" onclick="myFunction()">Try it</button>
        <button type="button" onclick="myFunction1()">Second</button>
         `;
        //   this.html = this.sanitized.bypassSecurityTrustHtml(`<div ng-app="">
        //   <p>Input something in the input box:</p>
        //   <p>Name :
        //     <input type="text" ng-model="name" placeholder="Enter name here">
        //   </p>
        //   <h1>Hello {{name}}</h1>
        // </div>`);
        // this.group.controls[this.config.name].patchValue('anteeea');
      }
    });
  }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    return this.group.controls[this.config.name].hasError('required') ? ValidationMessages.requiredMessage(this.config) : '';
  }

  ante() {
    console.log('asdasddsa');
  }

  mate() {
    console.log('change');
  }
}
