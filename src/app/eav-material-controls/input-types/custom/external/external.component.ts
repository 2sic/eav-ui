import {
  Component, OnInit, ViewChild, Input, ChangeDetectionStrategy,
  ElementRef, AfterViewInit, AfterContentInit
} from '@angular/core';
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
import { EavEntity, EavValue, EavDimensions } from '../../../../shared/models/eav';
import { CustomInputType } from '../../../../shared/models';
import { Subscription } from 'rxjs/Subscription';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class ExternalComponent implements Field, OnInit, AfterViewInit, AfterContentInit {
  @ViewChild('container') elReference: ElementRef;
  @Input() config: FieldConfig;
  group: FormGroup;


  private subscriptions: Subscription[] = [];
  loaded = false;

  window: any = window;

  html: SafeHtml;

  customInputTypeFactory;

  customInputTypeHost = {
    update: (value) => this.update(value)
  };

  constructor(private scriptLoaderService: ScriptLoaderService) {
    this.window.addOn = new CustomInputType(this.registerAddOn.bind(this));
  }
  // private elementRef: ElementRef
  ngOnInit() {
    // Observable.fromEvent(this.elReference1.nativeElement, 'change')
    //   .do(ev => console.log('test', this.elReference1.nativeElement.value))
    //   .subscribe(c => {
    //     this.group.controls[this.config.name].patchValue(this.elReference1.nativeElement.value);
    //   });

    // TODO add distroy

    this.loadCustomInputTypeScript();

    this.suscribeValueChanges();
  }

  // this is inside angular
  registerAddOn(factory) {
    console.log('call registerAddOn', factory);

    this.customInputTypeFactory = factory;
  }

  ngAfterContentInit() {
  }

  ngAfterViewInit() {
    // document.getElementById('demo').onchange = 'faca';
  }

  loadCustomInputTypeScript() {
    const script: ScriptModel = {
      name: 'myScript',
      src: 'assets/script/my-custom-input-type.js',
      loaded: false,
      template: ''
    };
    // 'assets/script/myScript.html'
    this.scriptLoaderService.load(script).subscribe(s => {
      console.log('loaded ScriptModel: ', s);

      this.loaded = s.loaded;
      if (this.loaded) {
        this.customInputTypeFactory.initialize(this.customInputTypeHost);
        this.customInputTypeFactory.render(this.elReference.nativeElement);

        // this.customInputTypeFactory.externalChange(this.elReference.nativeElement, 'new value');
      }
    });
  }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  update(value) {
    console.log('update change', value);
    // TODO: validate value
    this.group.controls[this.config.name].patchValue(value);
  }

  /**
   * subscribe to form value changes
   */
  private suscribeValueChanges() {
    // const value = this.group.controls[this.config.name].value;
    this.subscriptions.push(
      this.group.valueChanges.subscribe((item) => {
        // if (value !== item[this.config.name]) {
        console.log('suscribeValueChanges', this.elReference.nativeElement);
        if (this.elReference.nativeElement.innerHTML) {
          this.customInputTypeFactory.externalChange(this.elReference.nativeElement, item[this.config.name]);
        }
        // }
      })
    );
  }
}
