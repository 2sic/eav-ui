import { Component, OnInit, Input, ViewChild, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { NgElement, WithProperties } from '@angular/elements';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { ValidationMessagesService } from '../../../../eav-material-controls/validators/validation-messages-service';
import { EavService } from '../../../../shared/services/eav.service';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { AdamConfig } from '../../../../shared/models/adam/adam-config';
// tslint:disable-next-line:max-line-length
import { ExternalWebComponentProperties, HiddenProps, ConnectorHost } from '../external-webcomponent-properties/external-webcomponent-properties';
import { LanguageService } from '../../../../shared/services/language.service';
import { ConnectorInstance } from './connector';
import { ContentTypeService } from '../../../../shared/services/content-type.service';
import { ContentType } from '../../../../shared/models/eav';
import { InputFieldHelper } from '../../../../shared/helpers/input-field-helper';
import { InputTypeName } from '../../../../shared/helpers/input-field-models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'external-webcomponent',
  templateUrl: './external-webcomponent.component.html',
  styleUrls: ['./external-webcomponent.component.scss']
})
@InputType({
  // wrapper: ['app-dropzone-wrapper', 'app-eav-localization-wrapper', 'app-expandable-wrapper', 'app-adam-attach-wrapper']
})
export class ExternalWebcomponentComponent implements OnInit, OnDestroy {
  @ViewChild('container') elReference: ElementRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  private subscriptions: Subscription[] = [];
  private subjects: BehaviorSubject<any>[] = [];
  private eavConfig: EavConfiguration;
  customEl: NgElement & WithProperties<ExternalWebComponentProperties<any>>;
  loadingSpinner = true;
  // externalFactory: any;
  updateTriggeredByControl = false;

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  get id() {
    return `${this.config.entity.entityId}${this.config.field.index}`;
  }

  value$: BehaviorSubject<any>;

  constructor(
    private validationMessagesService: ValidationMessagesService,
    private eavService: EavService,
    private translateService: TranslateService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private _ngZone: NgZone,
    private languageService: LanguageService,
    private contentTypeService: ContentTypeService,
  ) {
    this.eavConfig = eavService.getEavConfiguration();
  }

  /**
   * This is host methods which the external control see
   */
  // spm 2019.04.08. move to hiddenProps
  public externalInputTypeHost = {
    attachAdam: () => this.attachAdam(),
    openDnnDialog: (oldValue: any, params: any, callback: any, dialog: MatDialog) => {
      this._ngZone.run(() => this.openDnnDialog(oldValue, params, callback, dialog));
    },
    getUrlOfIdDnnDialog: (value: string, callback: any) => {
      this._ngZone.run(() => this.getUrlOfIdDnnDialog(value, callback));
    },
  };

  ngOnInit() { }

  private update(value: any) {
    // TODO: validate value
    this.group.controls[this.config.field.name].patchValue(value);
    this.group.controls[this.config.field.name].markAsDirty();
    this.updateTriggeredByControl = true;
    console.log('Petar wysiwyg order: host update(value)', this.group.controls[this.config.field.name].value);
  }

  private updateField(name: string, value: any) {
    this.group.controls[name].patchValue(value);
    this.group.controls[name].markAsDirty();
    this.updateTriggeredByControl = false;
  }

  /**
   * This methos is called when all scripts and styles are loaded
   * (scripts are registering element, then we create that web component element)
   */
  public renderWebComponent = () => {
    this._ngZone.run(() => this.createElementWebComponent());
  }

  private createElementWebComponent() {
    // temp: harcoded - need to read from config
    const customElName = `field-${this.config.field.fullInputType}`;
    this.customEl = document.createElement(customElName) as any;

    this.customEl.host = this.externalInputTypeHost;
    // spm pass language service secretly as well
    this.customEl.translateService = this.translateService;

    this.customEl.hiddenProps = this.calculateHiddenProps();
    this.customEl.connector = this.buildConnector();
    console.log('Petar order host createElementWebComponent');
    this.elReference.nativeElement.appendChild(this.customEl);

    this.suscribeValueChanges();
    this.subscribeFormChange();
    this.loadingSpinner = false;
  }

  // spm 2019.04.08. move to hiddenProps
  openDnnDialog(oldValue: any, params: any, callback: any, dialog1: MatDialog) {
    this.dnnBridgeService.open(
      oldValue,
      params,
      callback,
      this.dialog);
  }

  // spm 2019.04.08. move to hiddenProps
  getUrlOfIdDnnDialog(value: string, urlCallback: any) {
    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(this.eavConfig.appId,
      value,
      this.config.entity.header.contentTypeName,
      this.config.entity.header.guid,
      this.config.field.name);

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
      this.config.adam.getValueCallback = () => this.group.controls[this.config.field.name].value;

      return {
        toggleAdam: (value1: any, value2: any) => {
          this._ngZone.run(() => this.config.adam.toggle(value1));
        },
        setAdamConfig: (adamConfig: AdamConfig) => {
          this._ngZone.run(() => this.config.adam.setConfig(adamConfig));
        },
        adamModeImage: () => {
          this._ngZone.run(() => (this.config && this.config.adam)
            ? this.config.adam.showImagesOnly
            : null);
        },
      };
    }
  }

  private buildConnector(): ConnectorInstance<any> {
    const connectorHost: ConnectorHost<any> = {
      update: value => {
        this._ngZone.run(() => this.update(value));
      },
    };
    this.value$ = new BehaviorSubject<any>(this.group.controls[this.config.field.name].value);
    this.subjects.push(this.value$);
    const connector = new ConnectorInstance<any>(connectorHost, this.value$.asObservable(), this.config.field);

    return connector;
  }

  private calculateHiddenProps(): HiddenProps {
    let allInputTypeNames: InputTypeName[];
    const contentType$: Observable<ContentType> = this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId);
    contentType$.pipe(first()).subscribe(data => {
      allInputTypeNames = InputFieldHelper.getInputTypeNamesFromAttributes(data.contentType.attributes);
    });

    const hiddenProps: HiddenProps = {
      allInputTypeNames: allInputTypeNames,
      updateField: (name, value) => {
        this._ngZone.run(() => this.updateField(name, value));
      },
      formGroup: this.group,
      formSetValueChange$: this.eavService.formSetValueChange$,
    };

    return hiddenProps;
  }

  /**
   * subscribe to form value changes for this field
   */
  private suscribeValueChanges() {
    this.subscriptions.push(
      this.group.controls[this.config.field.name].valueChanges.subscribe(newValue => {
        // do when this control updates the form
        this.value$.next(newValue);
      })
    );
  }

  /**
   * This is subscribe for all setforms - even if is not changing value.
   */
  private subscribeFormChange() {
    this.subscriptions.push(
      this.eavService.formSetValueChange$.subscribe(formSet => {
        if (!this.updateTriggeredByControl) {
          // do when some other control updated the form
          const newValue = formSet[this.config.field.name];
          this.value$.next(newValue);
        }
        this.updateTriggeredByControl = false;
      })
    );
  }

  // private setAdamOptions() {
  //   // set Adam disabled state
  //   if (this.config.currentFieldConfig.adam) {
  //     this.config.currentFieldConfig.adam.disabled = this.group.controls[this.config.currentFieldConfig.name].disabled;
  //   }
  // }

  ngOnDestroy() {
    // spm 2019.04.05. figure out which subscriptions we have to end manually
    return;
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subjects.forEach(subject => {
      subject.complete();
    });
    this.customEl.parentNode.removeChild(this.customEl);
    this.customEl = null;
  }
}
