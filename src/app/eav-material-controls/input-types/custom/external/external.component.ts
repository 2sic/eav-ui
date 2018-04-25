import {
  Component, OnInit, ViewChild, Input, ChangeDetectionStrategy,
  ElementRef, AfterViewInit, AfterContentInit
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldExternal } from '../../../../eav-dynamic-form/model/field-external';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessages } from '../../../validators/validation-messages';
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
    factory.initialize(this.externalInputTypeHost);
    factory.render(this.elReference.nativeElement);

    this.suscribeValueChanges(factory);
  }

  // get inputInvalid() {
  //   return this.group.controls[this.config.name].invalid;
  // }

  private update(value) {
    console.log('update change', value);
    // TODO: validate value
    this.group.controls[this.config.name].patchValue(value);
  }

  /**
   * subscribe to form value changes
   */
  private suscribeValueChanges(factory: any) {
    this.subscriptions.push(
      this.group.valueChanges.subscribe((item) => {
        console.log('suscribeValueChanges', this.elReference.nativeElement);
        if (this.elReference.nativeElement.innerHTML) {
          factory.externalChange(this.elReference.nativeElement, item[this.config.name]);
        }
      })
    );
  }
}
