import {
  Component, OnInit, ViewChild, Input, ElementRef
} from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldExternal } from '../../../../eav-dynamic-form/model/field-external';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

import { Subscription } from 'rxjs/Subscription';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external',
  templateUrl: './external.component.html',
  styleUrls: ['./external.component.css']
})
@InputType({
  wrapper: ['app-dropzone', 'app-eav-localization-wrapper'],
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
      this.externalFactory = value;
    }
  }

  private subscriptions: Subscription[] = [];
  loaded = true;

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  get id() {
    return `${this.config.entityId}${this.config.index}`;
  }

  externalFactory: any;

  constructor(private validationMessagesService: ValidationMessagesService,
    private eavService: EavService) { }

  /**
   * This is host methods which the external control sees
   */
  private externalInputTypeHost = {
    update: (value) => this.update(value),
    setInitValues: (value) => this.setInitValues(),
    // toggleAdam: (value1, value2) => this.toggleAdam(value1, value2),
    // adamModeImage: () => (this.config && this.config.adam) ? this.config.adam.showImagesOnly : null,
    attachAdam: () => this.attachAdam()
  };

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
        // if (this.externalFactory && this.externalFactory.isDirty) {
        Object.keys(control.errors).forEach(key => {
          if (messages[key]) {
            formError = messages[key](this.config);
          }
        });
        // }
        // }
      }
    }
    // console.log('control.dirty:', control.dirty);
    // console.log('control.touched:', control.touched);
    return formError;

    // this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config));
    // return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }

  ngOnInit() { }

  private renderExternalComponent(factory: any) {
    console.log('this.customInputTypeHost', this.externalInputTypeHost);
    console.log('this.customInputTypeHost', this.elReference.nativeElement);
    factory.initialize(this.externalInputTypeHost, this.config, this.id);
    factory.render(this.elReference.nativeElement);
    console.log('factory.writeValue(', this.group.controls[this.config.name].value);

    // factory.writeValue(this.elReference.nativeElement, this.group.controls[this.config.name].value);
    // this.setExternalControlValues(factory, this.group.controls[this.config.name].value);

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
   * Set initial values when external component is initialized
   */
  private setInitValues() {
    this.setExternalControlValues(this.externalFactory, this.group.controls[this.config.name].value);
  }

  private attachAdam() {
    // TODO:
    // If adam registered then attach Adam
    console.log('setInitValues');
    if (this.config.adam) {
      console.log('adam is registered - adam attached updateCallback', this.externalFactory);
      // set update callback = external method setAdamValue

      // callbacks - functions called from adam

      this.config.adam.updateCallback = (value) =>
        this.externalFactory.adamSetValue
          ? this.externalFactory.adamSetValue(value)
          : alert('adam attached but adamSetValue method not exist');


      this.config.adam.afterUploadCallback = (value) =>
        this.externalFactory.adamAfterUpload
          ? this.externalFactory.adamAfterUpload(value)
          : alert('adam attached but adamAfterUpload method not exist');

      // return value from form
      this.config.adam.getValueCallback = () => this.group.controls[this.config.name].value;

      return {
        toggleAdam: (value1, value2) => this.config.adam.toggle(value1), // this.toggleAdam(value1, value2)
        adamModeImage: () => (this.config && this.config.adam) ? this.config.adam.showImagesOnly : null,
      };
    }
  }

  /**
   * subscribe to form value changes for this field
   */
  private suscribeValueChanges(factory: any) {
    this.subscriptions.push(
      this.group.controls[this.config.name].valueChanges.subscribe((item) => {
        console.log('ExternalComponent suscribeValueChanges', item);
        this.setExternalControlValues(factory, item);
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
        console.log('set valueeee', value);
        factory.setValue(this.elReference.nativeElement, value);
      }
      factory.setOptions(this.elReference.nativeElement, this.group.controls[this.config.name].disabled);

      // this.setAdamOptions();
    }
  }


  // private setAdamOptions() {
  //   // set Adam disabled state
  //   if (this.config.adam) {
  //     this.config.adam.disabled = this.group.controls[this.config.name].disabled;
  //   }
  // }
}
