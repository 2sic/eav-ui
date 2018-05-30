import {
  Component, OnInit, ViewChild, Input, ChangeDetectionStrategy,
  ElementRef, AfterViewInit, AfterContentInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldExternal } from '../../../../eav-dynamic-form/model/field-external';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
// import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { LocalizationHelper } from '../../../../shared/helpers/localization-helper';
// import { ScriptLoaderService, ScriptModel } from '../../../../shared/services/script.service';
// import { Observable } from 'rxjs/Observable';

// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/do';
// import 'rxjs/add/observable/fromEvent';

// import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EavEntity, EavValue, EavDimensions } from '../../../../shared/models/eav';
import { CustomInputType } from '../../../../shared/models';
import { Subscription } from 'rxjs/Subscription';
import { ExternalFactory } from '../../../../eav-dynamic-form/model/external-factory';
import { Observable } from 'rxjs/Observable';
import { LanguageService } from '../../../../shared/services/language.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class ExternalComponent implements FieldExternal, OnInit {
  @ViewChild('container') elReference: ElementRef;
  @Input() config: FieldConfig;
  group: FormGroup;
  @Input()
  set factory(value: any) {
    console.log('set factory', value);
    if (value) {
      this.renderExternalComponent(value);
    }
  }

  private subscriptions: Subscription[] = [];
  // loaded = false;

  // window: any = window;

  // html: SafeHtml;

  // customInputTypeFactory;

  private externalInputTypeHost = {
    update: (value) => this.update(value)
  };

  constructor(private validationMessagesService: ValidationMessagesService) { }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  getErrorMessage() {
    // console.log('trigger getErrorMessage1:', this.config.name);
    // console.log('trigger getErrorMessage:',

    let formError = '';
    const control = this.group.controls[this.config.name];
    if (control) {
      const messages = this.validationMessagesService.validationMessages();
      if (control && control.invalid) {
        // if ((control.dirty || control.touched)) {
        Object.keys(control.errors).forEach(key => {
          if (messages[key]) {
            formError = messages[key](this.config);
          }
        });
        // }
      }
    }
    console.log('control.dirty:', control.dirty);
    console.log('control.touched:', control.touched);
    return formError;

    // this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config));
    // return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }



  ngOnInit() {


    // Observable.fromEvent(this.elReference1.nativeElement, 'change')
    //   .do(ev => console.log('test', this.elReference1.nativeElement.value))
    //   .subscribe(c => {
    //     this.group.controls[this.config.name].patchValue(this.elReference1.nativeElement.value);
    //   });

    // TODO add distroy
    // if (this.config.name !== 'customStaticName') {
    //   console.log('load assets/script/colour-picker.js');
    //   this.loadExternalnputTypeScript('assets/script/colour-picker.js');
    // } else {
    //   console.log('load assets/script/colour-picker2.js');
    //   this.loadExternalnputTypeScript('assets/script/colour-picker2.js');
    // }

    // this.suscribeValueChanges();
  }

  // // this is inside angular
  // registerAddOn(factory) {
  //   console.log('template', this.template);
  //   console.log('call registerAddOn', factory);
  //   this.template = 'bbbbbbbbbb';
  //   console.log('template2', this.template);

  //   // factory.initialize(this.customInputTypeHost);
  //   // factory.render(this.elReference.nativeElement);
  //   // this.customInputTypeFactory = factory;
  //   console.log('call this.customInputTypeFactory', factory);
  // }

  // loadExternalnputTypeScript(name) {
  //   const script: ScriptModel = {
  //     name: 'myScript1',
  //     src: name,
  //     loaded: false,
  //     template: ''
  //   };
  //   // 'assets/script/myScript.html'
  //   this.scriptLoaderService.load(script).subscribe(s => {
  //     console.log('loaded ScriptModel: ', s);

  //     this.loaded = s.loaded;
  //     if (this.loaded) {
  //       console.log('template3', this.template);
  //       console.log('call this.customInputTypeFactory1', this.customInputTypeFactory);
  //       // this.customInputTypeFactory.initialize(this.customInputTypeHost);
  //       // this.customInputTypeFactory.render(this.elReference.nativeElement);

  //       // this.customInputTypeFactory.externalChange(this.elReference.nativeElement, '#ff00ff');
  //     }
  //   });
  // }

  private renderExternalComponent(factory: any) {
    console.log('this.customInputTypeHost', this.externalInputTypeHost);
    console.log('this.customInputTypeHost', this.elReference.nativeElement);
    factory.initialize(this.externalInputTypeHost, this.config.name);
    factory.render(this.elReference.nativeElement, this.config.name);
    console.log('factory.writeValue(', this.group.controls[this.config.name].value);

    // factory.writeValue(this.elReference.nativeElement, this.group.controls[this.config.name].value);
    this.writeFromFormToView(factory, this.group.controls[this.config.name].value);

    this.suscribeValueChanges(factory);
    // this.subscribeToCurrentLanguageFromStore(factory);
  }

  private update(value) {
    console.log('ExternalComponent update change', value);
    // TODO: validate value
    this.group.controls[this.config.name].patchValue(value);
  }

  /**
   * subscribe to form value changes
   */
  private suscribeValueChanges(factory: any) {
    this.subscriptions.push(
      this.group.valueChanges.subscribe((item) => {
        console.log('ExternalComponent suscribeValueChanges', item[this.config.name]);
        this.writeFromFormToView(factory, item[this.config.name]);
      })
    );
  }


  /**
   * write value from the form into the view in external component
   * @param factory
   * @param value
   */
  private writeFromFormToView(factory, value) {
    // if container have value
    if (this.elReference.nativeElement.innerHTML) {
      if (value) {
        factory.writeValue(this.elReference.nativeElement, value);
      }
      factory.writeOptions(this.elReference.nativeElement, this.config, this.config.name, this.group.controls[this.config.name].disabled);
    }
  }
}
