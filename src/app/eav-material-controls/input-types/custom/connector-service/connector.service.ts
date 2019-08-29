import { NgZone, ElementRef } from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
// tslint:disable-next-line:max-line-length
import { ExternalWebComponentProperties, ConnectorHost, ExperimentalProps } from '../external-webcomponent-properties/external-webcomponent-properties';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { AdamConfig } from '../../../../shared/models/adam/adam-config';
import { ConnectorInstance } from '../external-webcomponent/connector';
import { InputTypeName } from '../../../../shared/models/input-field-models';
import { InputFieldHelper } from '../../../../shared/helpers/input-field-helper';
import { ContentTypeService } from '../../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../../shared/store/ngrx-data/feature.service';

export class ConnectorService {
  private subscriptions: Subscription[] = [];
  private subjects: BehaviorSubject<any>[] = [];
  private customEl: NgElement & WithProperties<ExternalWebComponentProperties<any>>;
  private eavConfig: EavConfiguration;
  private value$: BehaviorSubject<any>;
  private previousValue: any;

  constructor(
    private _ngZone: NgZone,
    private contentTypeService: ContentTypeService,
    private dialog: MatDialog,
    private dnnBridgeService: DnnBridgeService,
    private eavService: EavService,
    private translateService: TranslateService,
    private customElContainer: ElementRef,
    private config: FieldConfigSet,
    private group: FormGroup,
    private featureService: FeatureService,
  ) {
    this.eavConfig = eavService.getEavConfiguration();
  }

  /**
   * This is host methods which the external control see
   */
  // spm 2019.04.08. move to experimentalProps
  private externalInputTypeHost = {
    attachAdam: (adamSetValue, adamAfterUpload) => this.attachAdam(adamSetValue, adamAfterUpload),
    openDnnDialog: (oldValue: any, params: any, callback: any, dialog: MatDialog) => {
      this._ngZone.run(() => this.openDnnDialog(oldValue, params, callback, dialog));
    },
    getUrlOfIdDnnDialog: (value: string, callback: any) => {
      this._ngZone.run(() => this.getUrlOfIdDnnDialog(value, callback));
    },
  };

  // spm 2019.04.08. move to experimentalProps
  private openDnnDialog(oldValue: any, params: any, callback: any, dialog1: MatDialog) {
    this.dnnBridgeService.open(
      oldValue,
      params,
      callback,
      this.dialog);
  }

  // spm 2019.04.08. move to experimentalProps
  private getUrlOfIdDnnDialog(value: string, urlCallback: any) {
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

  private attachAdam(adamSetValue, adamAfterUpload) {
    // spm check if adam is enabled
    if (!this.config.adam) { return; }

    if (!adamSetValue || !adamAfterUpload) {
      // callbacks - functions called from adam, old wysiwyg
      this.config.adam.updateCallback = (value) =>
        this.customEl.adamSetValueCallback
          ? this.customEl.adamSetValueCallback = value
          : alert('adam attached but adamSetValue method not exist');

      this.config.adam.afterUploadCallback = (value) =>
        this.customEl.adamAfterUploadCallback
          ? this.customEl.adamAfterUploadCallback = value
          : alert('adam attached but adamAfterUpload method not exist');
    } else {
      // new wysiwyg
      this.config.adam.updateCallback = (value) => { adamSetValue(value); };
      this.config.adam.afterUploadCallback = (value) => { adamAfterUpload(value); };
    }
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

  public createElementWebComponent(config: FieldConfigSet, group: FormGroup, customElContainer: ElementRef, customElName: string) {
    this.customElContainer = customElContainer;
    this.config = config;
    this.group = group;

    this.customEl = document.createElement(customElName) as any;
    this.customEl.host = this.externalInputTypeHost;
    // spm pass language service secretly as well
    this.customEl.translateService = this.translateService;

    this.customEl.experimental = this.calculateExperimentalProps();
    this.customEl.connector = this.buildConnector();
    console.log('Petar order host createElementWebComponent');
    this.customElContainer.nativeElement.appendChild(this.customEl);

    this.subscribeFormChange();
  }

  private buildConnector(): ConnectorInstance<any> {
    const connectorHost: ConnectorHost<any> = {
      update: value => {
        this._ngZone.run(() => this.update(value));
      },
    };
    this.previousValue = this.group.controls[this.config.field.name].value;
    this.value$ = new BehaviorSubject<any>(this.group.controls[this.config.field.name].value);
    this.subjects.push(this.value$);
    const connector = new ConnectorInstance<any>(connectorHost, this.value$.asObservable(), this.config.field);

    return connector;
  }

  private calculateExperimentalProps(): ExperimentalProps {
    let allInputTypeNames: InputTypeName[];
    const contentType$ = this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId);
    contentType$.pipe(take(1)).subscribe(data => {
      allInputTypeNames = InputFieldHelper.getInputTypeNamesFromAttributes(data.contentType.attributes);
    });

    const experimentalProps: ExperimentalProps = {
      entityGuid: this.config.entity.entityGuid,
      allInputTypeNames: allInputTypeNames,
      updateField: (name, value) => {
        this._ngZone.run(() => this.updateField(name, value));
      },
      formGroup: this.group,
      formSetValueChange$: this.eavService.formSetValueChange$,
      isFeatureEnabled: (guid) => this.featureService.isFeatureEnabled(guid),
    };
    // optional props
    if (this.config.dropzoneConfig$) {
      experimentalProps.dropzoneConfig$ = this.config.dropzoneConfig$;
    }

    return experimentalProps;
  }

  /**
   * This is subscribe for all setforms - even if is not changing value.
   */
  private subscribeFormChange() {
    this.subscriptions.push(
      this.eavService.formSetValueChange$.subscribe(formSet => {
        // check if update is for current form
        if (formSet.formId !== this.config.form.formId) { return; }

        // check if update is for this field
        const newValue = formSet.formValues[this.config.field.name];
        if (this.previousValue === newValue) { return; }

        this.previousValue = newValue;
        this.value$.next(newValue);
      })
    );
  }

  private update(value: any) {
    // TODO: validate value
    this.group.controls[this.config.field.name].patchValue(value);
    this.group.controls[this.config.field.name].markAsDirty();
    console.log('Petar wysiwyg order: host update(value)', this.group.controls[this.config.field.name].value);
  }

  private updateField(name: string, value: any) {
    if (!this.group.controls[name] || this.group.controls[name].disabled) { return; }
    this.group.controls[name].patchValue(value);
    this.group.controls[name].markAsDirty();
  }

  public destroy() {
    // spm 2019.04.05. figure out which subscriptions we have to end manually
    console.log('Connector destroyed');
    // return;
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
