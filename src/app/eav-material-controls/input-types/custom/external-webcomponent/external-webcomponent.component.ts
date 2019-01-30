import { Component, OnInit, Input, ViewChild, ElementRef, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { ValidationMessagesService } from '../../../../eav-material-controls/validators/validation-messages-service';
import { EavService } from '../../../../shared/services/eav.service';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { AdamConfig } from '../../../../shared/models/adam/adam-config';
import { NgElement, WithProperties } from '@angular/elements';
import { ExternalWebComponentProperties } from '../external-webcomponent-properties/external-webcomponent-properties';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external-webcomponent',
  templateUrl: './external-webcomponent.component.html',
  styleUrls: ['./external-webcomponent.component.scss']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper', 'app-expandable-wrapper', 'app-dropzone-wrapper', 'app-adam-attach-wrapper']
})
export class ExternalWebcomponentComponent implements OnInit {
  @ViewChild('container') elReference: ElementRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  // @Input()
  // set factory(value: any) {
  //   if (value) {
  //     this.renderExternalComponent(value);
  //     this.subscribeFormChange(value);
  //     this.externalFactory = value;
  //   }
  // }
  private subscriptions: Subscription[] = [];
  private eavConfig: EavConfiguration;

  customEl: NgElement & WithProperties<ExternalWebComponentProperties>;
  loaded = true;
  // externalFactory: any;
  updateTriggeredByControl = false;

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  get id() {
    return `${this.config.entityId}${this.config.index}`;
  }

  constructor(private validationMessagesService: ValidationMessagesService,
    private eavService: EavService,
    private translateService: TranslateService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private _ngZone: NgZone) {
    this.eavConfig = eavService.getEavConfiguration();
  }

  /**
   * This is host methods which the external control sees
   */
  public externalInputTypeHost = {
    update: (value: string) => {
      this._ngZone.run(() => this.update(value));
    },
    setInitValues: (value: string) => {
      this._ngZone.run(() => this.setInitValues());
    },
    attachAdam: () => this.attachAdam(),
    openDnnDialog: (oldValue: any, params: any, callback: any, dialog: MatDialog) => {
      this._ngZone.run(() => this.openDnnDialog(oldValue, params, callback, dialog));
    },
    getUrlOfIdDnnDialog: (value: string, callback: any) => {
      this._ngZone.run(() => this.getUrlOfIdDnnDialog(value, callback));
    },
  };

  ngOnInit() {
    this.customEl = document.createElement('wysiwyg-webcomponent') as any;

    this.customEl.host = this.externalInputTypeHost;
    this.customEl.config = this.config;
    this.customEl.form = this.group;
    this.customEl.id = this.id;
    this.customEl.translateService = this.translateService;

    console.log('element created:', this.customEl);
    this.elReference.nativeElement.appendChild(this.customEl);

    console.log('this.elReference.nativeElement:', this.elReference.nativeElement);

    // temp
    // this.customEl.value = 'ante';
    // this.customEl.disabled = false;

    this.suscribeValueChanges();
  }

  // private renderExternalComponent(factory: any) {

  //   // factory.initialize(this.externalInputTypeHost, this.config, this.group, this.translate, this.id);
  //   // factory.render(this.elReference.nativeElement);

  //   // this.suscribeValueChanges(factory);

  //   //this.loaded = false;
  // }

  private update(value: string) {
    // TODO: validate value
    this.group.controls[this.config.name].patchValue(value);
    this.setDirty();
    this.updateTriggeredByControl = true;
  }

  openDnnDialog(oldValue: any, params: any, callback: any, dialog1: MatDialog) {
    this.dnnBridgeService.open(
      oldValue,
      params,
      callback,
      this.dialog);
  }

  getUrlOfIdDnnDialog(value: string, urlCallback: any) {
    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(this.eavConfig.appId,
      value,
      this.config.header.contentTypeName,
      this.config.header.guid,
      this.config.name);

    if (urlFromId$) {
      // this.subscriptions.push(
      urlFromId$.subscribe((data) => {
        if (data) {
          urlCallback(data);
        }
      });
      // );
    } else {
      urlCallback(value);
    }
  }

  /**
   * Set initial values when external component is initialized
   */
  private setInitValues() {
    this.setExternalControlValues(this.group.controls[this.config.name].value);
    this.setExternalControlOptions();
  }

  private attachAdam() {
    // TODO:
    // If adam registered then attach Adam
    if (this.config.adam) {
      // console.log('adam is registered - adam attached updateCallback', this.externalFactory);
      // set update callback = external method setAdamValue

      // callbacks - functions called from adam

      this.config.adam.updateCallback = (value) =>
        this.customEl.adamSetValueCallback
          ? this.customEl.adamSetValueCallback = value
          : alert('adam attached but adamSetValue method not exist');

      this.config.adam.afterUploadCallback = (value) =>
        this.customEl.adamAfterUploadCallback
          ? this.customEl.adamAfterUploadCallback = value
          : alert('adam attached but adamAfterUpload method not exist');

      // return value from form
      this.config.adam.getValueCallback = () => this.group.controls[this.config.name].value;

      return {
        toggleAdam: (value1: any, value2: any) => {
          this._ngZone.run(() => this.config.adam.toggle(value1));
        },
        setAdamConfig: (adamConfig: AdamConfig) => {
          this._ngZone.run(() => this.config.adam.setConfig(adamConfig));
        },
        adamModeImage: () => {
          this._ngZone.run(() => (this.config && this.config.adam) ? this.config.adam.showImagesOnly : null);
        },
      };
    }
  }

  /**
   * subscribe to form value changes for this field
   */
  private suscribeValueChanges() {
    this.subscriptions.push(
      this.group.controls[this.config.name].valueChanges.subscribe((item) => {
        this.setExternalControlValues(item);
        this.setExternalControlOptions();
      })
    );
  }

  /**
   * This is subscribe for all setforms - even if is not changing value.
   * @param factory
   */
  // private subscribeFormChange(factory: any) {
  //   this.subscriptions.push(
  //     this.eavService.formSetValueChange$.subscribe((item) => {
  //       if (!this.updateTriggeredByControl) {
  //         this.setExternalControlValues(factory, item[this.config.name]);
  //         this.setExternalControlOptions(factory);
  //       }
  //       this.updateTriggeredByControl = false;
  //     })
  //   );
  // }

  private setDirty() {
    this.group.controls[this.config.name].markAsDirty();
  }

  /**
   * write value from the form into the view in external component
   * @param factory
   * @param value
   */
  private setExternalControlValues(value: string) {
    // if container have value
    if (this.elReference.nativeElement.innerHTML) {
      if (value) {
        this.customEl.value = value;
      }
    }
  }

  /**
   * refresh only exteranl component options
   */
  private setExternalControlOptions() {
    // if container have value
    if (this.elReference.nativeElement.innerHTML) {
      this.customEl.disabled = this.group.controls[this.config.name].disabled;
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
