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
import { EavService } from '../../../../shared/services/eav.service';


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
      this.subscribeFormChange(value);
    }
  }


  private subscriptions: Subscription[] = [];
  loaded = true;

  // window: any = window;

  // html: SafeHtml;

  // customInputTypeFactory;

  private externalInputTypeHost = {
    update: (value) => this.update(value)
  };

  constructor(private validationMessagesService: ValidationMessagesService,
    private eavService: EavService) { }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  get id() {
    return `${this.config.entityId}${this.config.index}`;
  }

  // TODO: need to finish validation
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
    // console.log('control.dirty:', control.dirty);
    // console.log('control.touched:', control.touched);
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
  }


  //   /**
  //  * Subscribe triggered when changing all in menu (forAllFields)
  //  */
  //   private subscribeMenuChange(factory: any) {
  //     this.subscriptions.push(
  //       this.languageService.localizationWrapperMenuChange$.subscribe(s => {
  //         console.log('MENU CHANGE INSIDE EXTERNAlCOMPONENT');
  //         factory.setOptions(this.elReference.nativeElement, this.group.controls[this.config.name].disabled);
  //       })
  //     );
  //   }

  private renderExternalComponent(factory: any) {
    console.log('this.customInputTypeHost', this.externalInputTypeHost);
    console.log('this.customInputTypeHost', this.elReference.nativeElement);
    factory.initialize(this.externalInputTypeHost, this.config, this.id);
    factory.render(this.elReference.nativeElement);
    console.log('factory.writeValue(', this.group.controls[this.config.name].value);

    // factory.writeValue(this.elReference.nativeElement, this.group.controls[this.config.name].value);
    this.setExternalControlValues(factory, this.group.controls[this.config.name].value);

    this.suscribeValueChanges(factory);
    // this.subscribeToCurrentLanguageFromStore(factory);
    this.loaded = false;
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
        this.setExternalControlValues(factory, item[this.config.name]);
      })
    );
  }

  /**
   * This is subscribe for all setforms - even if is not changing value.
   * @param factory
   */
  private subscribeFormChange(factory: any) {
    this.subscriptions.push(
      this.eavService.formSetValueChange$.subscribe((item) => {
        console.log('Formm CHANGEEEEEEEEEEEEEEEEEE', item);
        this.setExternalControlValues(factory, item[this.config.name]);
      })
    );
  }

  /**
   * write value from the form into the view in external component
   * @param factory
   * @param value
   */
  private setExternalControlValues(factory, value) {
    // if container have value
    if (this.elReference.nativeElement.innerHTML) {
      if (value) {
        factory.setValue(this.elReference.nativeElement, value);
      }
      factory.setOptions(this.elReference.nativeElement, this.group.controls[this.config.name].disabled);
    }
  }
}
