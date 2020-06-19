import { NgZone, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { DnnBridgeService } from '../../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../../shared/services/eav.service';
import { EavConfiguration } from '../../../../../shared/models/eav-configuration';
import { ConnectorInstance, ConnectorHost } from './models/connector-instance.model';
import { InputFieldHelper } from '../../../../../shared/helpers/input-field-helper';
import { ContentTypeService } from '../../../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../../../shared/store/ngrx-data/input-type.service';
import { ExpandableFieldService } from '../../../../../shared/services/expandable-field.service';
import { ExperimentalProps, InputTypeName, EavCustomInputField } from '../../../../../../edit-types';
import { angularConsoleLog } from '../../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

export class ConnectorService {
  private subscriptions: Subscription[] = [];
  private subjects: BehaviorSubject<any>[] = [];
  private customEl: EavCustomInputField<any>;
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

  public createElementWebComponent(config: FieldConfigSet, group: FormGroup, customElContainer: ElementRef, customElName: string) {
    this.customElContainer = customElContainer;
    this.config = config;
    this.group = group;

    this.customEl = document.createElement(customElName) as any;
    this.customEl.connector = this.buildConnector();
    angularConsoleLog('order host createElementWebComponent');
    this.customElContainer.nativeElement.appendChild(this.customEl);

    this.subscribeFormChange();
  }

  private buildConnector(): ConnectorInstance<any> {
    const connectorHost: ConnectorHost<any> = {
      update: value => {
        this._ngZone.run(() => this.update(value));
      },
      forceConnectorSave$: this.eavService.forceConnectorSave$$,
      expand: (expand, componentTag) => {
        this._ngZone.run(() => {
          this.expandableFieldService.expand(expand, this.config.field.index, this.config.form.formId, componentTag);
        });
      },
    };
    this.previousValue = this.group.controls[this.config.field.name].value;
    this.value$ = new BehaviorSubject<any>(this.group.controls[this.config.field.name].value);
    this.subjects.push(this.value$);
    const experimental = this.calculateExperimentalProps();
    const connector = new ConnectorInstance<any>(
      connectorHost, this.value$.asObservable(), this.config.field, experimental, this.eavConfig
    );

    return connector;
  }

  private calculateExperimentalProps(): ExperimentalProps {
    let allInputTypeNames: InputTypeName[];
    const contentType$ = this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId);
    contentType$.pipe(take(1)).subscribe(data => {
      allInputTypeNames = InputFieldHelper.calculateInputTypes(data.contentType.attributes, this.inputTypeService);
    });

    const experimentalProps: ExperimentalProps = {
      entityGuid: this.config.entity.entityGuid,
      allInputTypeNames,
      updateField: (name, value) => {
        this._ngZone.run(() => this.updateField(name, value));
      },
      formGroup: this.group,
      isFeatureEnabled: (guid) => this.featureService.isFeatureEnabled(guid),
      translateService: this.translateService,
      setFocused: (focused) => {
        this._ngZone.run(() => { this.config.field.focused = focused; });
      },
      openDnnDialog: (oldValue, params, callback) => {
        this._ngZone.run(() => this.openDnnDialog(oldValue, params, callback));
      },
      getUrlOfIdDnnDialog: (value, callback) => {
        this._ngZone.run(() => this.getUrlOfIdDnnDialog(value, callback));
      },
      expandedField$: this.expandableFieldService.getObservable(),
      dropzone: this.config.dropzone,
      adam: this.config.adam,
    };

    return experimentalProps;
  }

  private openDnnDialog(oldValue: any, params: any, callback: any) {
    this.dnnBridgeService.open(oldValue, params, callback, this.dialog);
  }

  private getUrlOfIdDnnDialog(value: string, urlCallback: (value: string) => any) {
    if (!value) { return; }

    // handle short-ID links like file:17
    const contentType = this.config.entity.header.ContentTypeName;
    const entityGuid = this.config.entity.header.Guid;
    const field = this.config.field.name;
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(value, contentType, entityGuid, field);

    if (!urlFromId$) {
      urlCallback(value);
      return;
    }

    urlFromId$.subscribe(data => {
      if (!data) { return; }
      urlCallback(data);
    });
  }

  /** This is subscribe for all setforms - even if is not changing value. */
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
    angularConsoleLog('wysiwyg order: host update(value)', this.group.controls[this.config.field.name].value);
  }

  private updateField(name: string, value: any) {
    if (!this.group.controls[name] || this.group.controls[name].disabled) { return; }
    this.group.controls[name].patchValue(value);
    this.group.controls[name].markAsDirty();
    this.group.controls[this.config.field.name].markAsTouched();
  }

  public destroy() {
    angularConsoleLog('Connector destroyed');
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subjects.forEach(subject => { subject.complete(); });
    this.customEl?.parentNode.removeChild(this.customEl);
    this.customEl = null;
  }
}
