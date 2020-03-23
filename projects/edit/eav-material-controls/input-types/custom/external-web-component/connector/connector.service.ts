import { NgZone, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { CustomElementProperties, ExperimentalProps } from './models/custom-element-properties.model';
import { DnnBridgeService } from '../../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../../shared/models/eav-configuration';
import { AdamConfig } from '../../../../../shared/models/adam/adam-config';
import { ConnectorInstance, ConnectorHost } from './models/connector-instance.model';
import { InputTypeName } from '../../../../../shared/models/input-field-models';
import { InputFieldHelper } from '../../../../../shared/helpers/input-field-helper';
import { ContentTypeService } from '../../../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../../../shared/store/ngrx-data/input-type.service';
import { ExpandableFieldService } from '../../../../../shared/services/expandable-field.service';
import { AdamSetValue, AdamAfterUpload } from '../../../../../../shared/adam.model';

export class ConnectorService {
  private subscriptions: Subscription[] = [];
  private subjects: BehaviorSubject<any>[] = [];
  private customEl: HTMLElement & CustomElementProperties<any>;
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
    private inputTypeService: InputTypeService,
    private expandableFieldService: ExpandableFieldService,
  ) {
    this.eavConfig = eavService.getEavConfiguration();
  }

  /**
   * This is host methods which the external control see
   */
  // spm 2019.04.08. move to experimentalProps
  private externalInputTypeHost = {
    attachAdam: (adamSetValue: AdamSetValue, adamAfterUpload: AdamAfterUpload) => this.attachAdam(adamSetValue, adamAfterUpload),
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
      urlFromId$.subscribe((data) => {
        if (data) { urlCallback(data); }
      });
    } else {
      urlCallback(value);
    }
  }

  private attachAdam(adamSetValue: AdamSetValue, adamAfterUpload: AdamAfterUpload) {
    // spm check if adam is enabled
    if (!this.config.adam) { return; }

    if (!adamSetValue || !adamAfterUpload) {
      // callbacks - functions called from adam, old wysiwyg
      this.config.adam.updateCallback = (value: any) =>
        this.customEl.adamSetValueCallback
          ? this.customEl.adamSetValueCallback = value
          : alert('adam attached but adamSetValue method not exist');

      this.config.adam.afterUploadCallback = (value: any) =>
        this.customEl.adamAfterUploadCallback
          ? this.customEl.adamAfterUploadCallback = value
          : alert('adam attached but adamAfterUpload method not exist');
    } else {
      // new wysiwyg
      this.config.adam.updateCallback = (value: any) => { adamSetValue(value); };
      this.config.adam.afterUploadCallback = (value: any) => { adamAfterUpload(value); };
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

  public createElementWebComponent(
    config: FieldConfigSet, group: FormGroup, customElContainer: ElementRef, customElName: string, inlineMode: boolean
  ) {
    this.customElContainer = customElContainer;
    this.config = config;
    this.group = group;

    this.customEl = document.createElement(customElName) as any;
    this.customEl.host = this.externalInputTypeHost;

    this.customEl.experimental = this.calculateExperimentalProps(inlineMode);
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
      forceConnectorSave$: this.eavService.forceConnectorSave$$,
    };
    this.previousValue = this.group.controls[this.config.field.name].value;
    this.value$ = new BehaviorSubject<any>(this.group.controls[this.config.field.name].value);
    this.subjects.push(this.value$);
    const connector = new ConnectorInstance<any>(connectorHost, this.value$.asObservable(), this.config.field);

    return connector;
  }

  private calculateExperimentalProps(inlineMode: boolean): ExperimentalProps {
    let allInputTypeNames: InputTypeName[];
    const contentType$ = this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId);
    contentType$.pipe(take(1)).subscribe(data => {
      allInputTypeNames = InputFieldHelper.calculateInputTypes(data.contentType.attributes, this.inputTypeService);
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
      translateService: this.translateService,
      expand: (expand) => {
        this._ngZone.run(() => {
          this.expandableFieldService.expand(expand, this.config.field.index, this.config.form.formId);
        });
      },
      setFocused: (focused) => {
        this._ngZone.run(() => { this.config.field.focused = focused; });
      },
      expandedField$: this.expandableFieldService.getObservable(),
    };
    // optional props
    if (this.config.dropzoneConfig$) {
      experimentalProps.dropzoneConfig$ = this.config.dropzoneConfig$;
    }
    if (InputFieldHelper.isWysiwygInputType(this.config.field.inputType)) {
      experimentalProps.wysiwygSettings = {
        inlineMode: inlineMode,
        buttonSource: this.config.field.settings.ButtonSource,
        buttonAdvanced: this.config.field.settings.ButtonAdvanced,
      };
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
        // check if update is for current entity
        if (formSet.entityGuid !== this.config.entity.entityGuid) { return; }
        // check if update is for this field
        const newValue = formSet.entityValues[this.config.field.name];
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
    this.group.controls[this.config.field.name].markAsTouched(); // spm should be marked on first focus. Read JSDoc
    console.log('Petar wysiwyg order: host update(value)', this.group.controls[this.config.field.name].value);
  }

  private updateField(name: string, value: any) {
    if (!this.group.controls[name] || this.group.controls[name].disabled) { return; }
    this.group.controls[name].patchValue(value);
    this.group.controls[name].markAsDirty();
    this.group.controls[this.config.field.name].markAsTouched();
  }

  public destroy() {
    console.log('Connector destroyed');
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subjects.forEach(subject => { subject.complete(); });
    this.customEl.parentNode.removeChild(this.customEl);
    this.customEl = null;
  }
}
