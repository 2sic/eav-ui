import { ElementRef, NgZone } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, take } from 'rxjs/operators';
import { EavCustomInputField, ExperimentalProps, FieldSettings, InputTypeName } from '../../../../../../edit-types';
import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { FieldValue } from '../../../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { InputFieldHelper } from '../../../../../shared/helpers/input-field-helper';
import { DnnBridgeService } from '../../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../../shared/services/edit-routing.service';
import { FieldsSettings2NewService } from '../../../../../shared/services/fields-settings2new.service';
import { ContentTypeService } from '../../../../../shared/store/ngrx-data/content-type.service';
import { FeatureService } from '../../../../../shared/store/ngrx-data/feature.service';
import { InputTypeService } from '../../../../../shared/store/ngrx-data/input-type.service';
import { ConnectorHost, ConnectorInstance } from './models/connector-instance.model';

export class ConnectorHelper {
  private control: AbstractControl;
  private customEl: EavCustomInputField<any>;
  private value$ = new BehaviorSubject<FieldValue>(null);
  private settings$ = new BehaviorSubject<FieldSettings>(null);
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
    private fieldsSettings2NewService: FieldsSettings2NewService,
    private zone: NgZone,
  ) {
    this.control = this.group.controls[this.config.fieldName];

    this.subscription.add(
      this.eavService.formValueChange$.pipe(
        filter(formSet => (formSet.formId === this.eavService.eavConfig.formId) && (formSet.entityGuid === this.config.entityGuid)),
        map(() => this.control.value),
        startWith(this.control.value),
        distinctUntilChanged(),
      ).subscribe(newValue => {
        this.value$.next(newValue);
      })
    );

    this.subscription.add(
      this.fieldsSettings2NewService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );

    this.customEl = document.createElement(this.customElName) as any;
    this.customEl.connector = this.buildConnector();
    this.customElContainerRef.nativeElement.appendChild(this.customEl);
  }

  destroy() {
    this.subscription.unsubscribe();
    this.value$.complete();
    this.settings$.complete();
    this.customEl?.parentNode.removeChild(this.customEl);
    this.customEl = null;
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
    this.subscription.add(
      this.settings$.subscribe(settings => {
        connector.field.settings = settings;
      })
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
          this.editRoutingService.expand(expand, this.config.index, this.config.entityGuid, componentTag);
        });
      },
    };
    return connectorHost;
  }

  private calculateExperimentalProps() {
    let allInputTypeNames: InputTypeName[];
    this.contentTypeService.getContentTypeById(this.config.contentTypeId).pipe(take(1)).subscribe(contentType => {
      allInputTypeNames = InputFieldHelper.calculateInputTypes(contentType.Attributes, this.inputTypeService);
    });

    const experimentalProps: ExperimentalProps = {
      entityGuid: this.config.entityGuid,
      allInputTypeNames,
      formGroup: this.group,
      translateService: this.translateService,
      isExpanded$: this.editRoutingService.isExpanded(this.config.index, this.config.entityGuid),
      dropzone: this.config.dropzone,
      adam: this.config.adam,
      updateField: (name, value) => {
        this.zone.run(() => { this.updateControl(this.group.controls[name], value); });
      },
      isFeatureEnabled: (guid) => this.featureService.isFeatureEnabled(guid),
      setFocused: (focused) => {
        this.zone.run(() => { this.config.field.focused$.next(focused); });
      },
      openPagePicker: (params, callback) => {
        this.zone.run(() => { this.dnnBridgeService.open('pagepicker', params, callback); });
      },
      getUrlOfId: (value, callback) => {
        this.zone.run(() => { this.getUrlOfId(value, callback); });
      },
    };

    return experimentalProps;
  }

  private getUrlOfId(value: string, callback: (value: string) => void) {
    if (!value) { return; }

    // handle short-ID links like file:17
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.dnnBridgeService.getUrlOfId(value, contentType, entityGuid, field).subscribe(path => {
      if (!path) { return; }
      callback(path);
    });
  }

  private updateControl(control: AbstractControl, value: any) {
    if (control == null || control.disabled) { return; }

    if (control.value !== value) { control.patchValue(value); }
    if (!control.dirty) { control.markAsDirty(); }
    if (!control.touched) { control.markAsTouched(); }
  }
}
