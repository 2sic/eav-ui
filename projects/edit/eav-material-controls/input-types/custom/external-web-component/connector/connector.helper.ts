import { NgZone, ElementRef } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { take, filter, map, distinctUntilChanged, startWith } from 'rxjs/operators';

import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { DnnBridgeService } from '../../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../../shared/services/eav.service';
import { ConnectorInstance, ConnectorHost } from './models/connector-instance.model';
import { InputFieldHelper } from '../../../../../shared/helpers/input-field-helper';
import { ContentTypeService } from '../../../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../../../shared/store/ngrx-data/input-type.service';
import { EditRoutingService } from '../../../../../shared/services/edit-routing.service';
import { ExperimentalProps, InputTypeName, EavCustomInputField } from '../../../../../../edit-types';

export class ConnectorHelper {
  private control: AbstractControl;
  private customEl: EavCustomInputField<any>;
  private value$ = new BehaviorSubject<any>(null);
  private subscription = new Subscription();

  constructor(
    private config: FieldConfigSet,
    private group: FormGroup,
    private customElContainerRef: ElementRef,
    private customElName: string,
    private eavService: EavService,
    private translateService: TranslateService,
    private contentTypeService: ContentTypeService,
    private inputTypeService: InputTypeService,
    private featureService: FeatureService,
    private editRoutingService: EditRoutingService,
    private dnnBridgeService: DnnBridgeService,
    private dialog: MatDialog,
    private zone: NgZone,
  ) {
    this.control = this.group.controls[this.config.field.name];

    this.subscription.add(
      this.eavService.formValueChange$.pipe(
        filter(formSet => (formSet.formId === this.config.form.formId) && (formSet.entityGuid === this.config.entity.entityGuid)),
        map(formSet => this.control.value),
        startWith(this.control.value),
        distinctUntilChanged(),
      ).subscribe(newValue => {
        this.value$.next(newValue);
      })
    );

    this.customEl = document.createElement(this.customElName) as any;
    this.customEl.connector = this.buildConnector();
    this.customElContainerRef.nativeElement.appendChild(this.customEl);
  }

  private buildConnector() {
    const connectorHost = this.calculateRegularProps();
    const experimental = this.calculateExperimentalProps();
    const connector = new ConnectorInstance<any>(
      connectorHost,
      this.value$.asObservable(),
      this.config.field,
      experimental,
      this.eavService.eavConfig,
    );
    return connector;
  }

  private calculateRegularProps() {
    const connectorHost: ConnectorHost<any> = {
      forceConnectorSave$: this.eavService.forceConnectorSave$,
      update: (value) => {
        this.zone.run(() => { this.updateControl(this.control, value); });
      },
      expand: (expand, componentTag) => {
        this.zone.run(() => {
          this.editRoutingService.expand(expand, this.config.field.index, this.config.entity.entityGuid, componentTag);
        });
      },
    };
    return connectorHost;
  }

  private calculateExperimentalProps() {
    let allInputTypeNames: InputTypeName[];
    this.contentTypeService.getContentTypeById(this.config.entity.contentTypeId).pipe(take(1)).subscribe(data => {
      allInputTypeNames = InputFieldHelper.calculateInputTypes(data.contentType.attributes, this.inputTypeService);
    });

    const experimentalProps: ExperimentalProps = {
      entityGuid: this.config.entity.entityGuid,
      allInputTypeNames,
      formGroup: this.group,
      translateService: this.translateService,
      isExpanded$: this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid),
      dropzone: this.config.dropzone,
      adam: this.config.adam,
      updateField: (name, value) => {
        this.zone.run(() => { this.updateControl(this.group.controls[name], value); });
      },
      isFeatureEnabled: (guid) => this.featureService.isFeatureEnabled(guid),
      setFocused: (focused) => {
        this.zone.run(() => { this.config.field.focused$.next(focused); });
      },
      openDnnDialog: (oldValue, params, callback) => {
        this.zone.run(() => { this.openDnnDialog(oldValue, params, callback); });
      },
      getUrlOfIdDnnDialog: (value, callback) => {
        this.zone.run(() => { this.getUrlOfIdDnnDialog(value, callback); });
      },
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
    this.dnnBridgeService.getUrlOfId(value, contentType, entityGuid, field).subscribe(path => {
      if (!path) { return; }
      urlCallback(path);
    });
  }

  private updateControl(control: AbstractControl, value: any) {
    if (control == null || control.disabled) { return; }

    if (control.value !== value) { control.patchValue(value); }
    if (!control.dirty) { control.markAsDirty(); }
    if (!control.touched) { control.markAsTouched(); }
  }

  public destroy() {
    this.subscription.unsubscribe();
    this.value$.complete();
    this.customEl?.parentNode.removeChild(this.customEl);
    this.customEl = null;
  }
}
