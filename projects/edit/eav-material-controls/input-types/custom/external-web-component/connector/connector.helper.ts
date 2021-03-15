import { ElementRef, NgZone } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';
import { EavCustomInputField, ExperimentalProps, FieldConfig, FieldValue } from '../../../../../../edit-types';
import { FieldConfigSet } from '../../../../../eav-dynamic-form/model/field-config';
import { InputFieldHelpers } from '../../../../../shared/helpers';
import { DnnBridgeService, EavService, EditRoutingService, FieldsSettingsService } from '../../../../../shared/services';
import { ContentTypeService, FeatureService, InputTypeService } from '../../../../../shared/store/ngrx-data';
import { ValidationMessagesService } from '../../../../validators/validation-messages-service';
import { ConnectorHost, ConnectorInstance } from './models/connector-instance.model';

export class ConnectorHelper {
  private control: AbstractControl;
  private customEl: EavCustomInputField;
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
    private fieldsSettingsService: FieldsSettingsService,
    private validationMessagesService: ValidationMessagesService,
    private zone: NgZone,
  ) {
    this.control = this.group.controls[this.config.fieldName];

    this.customEl = document.createElement(this.customElName) as EavCustomInputField;
    this.customEl.connector = this.buildConnector();
    this.customElContainerRef.nativeElement.appendChild(this.customEl);
  }

  destroy() {
    this.subscription.unsubscribe();
    this.customEl?.parentNode.removeChild(this.customEl);
    this.customEl = null;
  }

  private buildConnector() {
    const connectorHost = this.calculateRegularProps();
    const experimental = this.calculateExperimentalProps();
    const fieldSettings = this.fieldsSettingsService.getFieldSettings(this.config.fieldName);
    const fieldConfig: FieldConfig = {
      name: this.config.fieldName,
      index: this.config.index,
      label: fieldSettings.Name,
      placeholder: fieldSettings.Placeholder,
      inputType: this.config.inputType,
      type: this.config.type,
      required: fieldSettings.Required,
      disabled: this.config.initialDisabled,
      settings: fieldSettings,
    };
    const value$ = this.control.valueChanges.pipe(
      startWith(this.control.value),
      distinctUntilChanged(),
    );
    const connector = new ConnectorInstance(connectorHost, value$, fieldConfig, experimental, this.eavService.eavConfig);
    this.subscription.add(
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        connector.field.settings = settings;
        connector.field.label = settings.Name;
        connector.field.placeholder = settings.Placeholder;
        connector.field.required = settings.Required;
      })
    );
    return connector;
  }

  private calculateRegularProps() {
    const connectorHost: ConnectorHost = {
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
    const contentType = this.contentTypeService.getContentType(this.config.contentTypeId);
    const inputTypes = this.inputTypeService.getInputTypes();
    const allInputTypeNames = InputFieldHelpers.getInputTypeNames(contentType.Attributes, inputTypes);

    const experimentalProps: ExperimentalProps = {
      entityGuid: this.config.entityGuid,
      allInputTypeNames,
      formGroup: this.group,
      translateService: this.translateService,
      isExpanded$: this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid),
      dropzone: this.config.dropzone,
      adam: this.config.adam,
      updateField: (name, value) => {
        this.zone.run(() => { this.updateControl(this.group.controls[name], value); });
      },
      isFeatureEnabled: (guid) => this.featureService.isFeatureEnabled(guid),
      setFocused: (focused) => {
        this.zone.run(() => { this.config.focused$.next(focused); });
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
    this.dnnBridgeService.getLinkInfo(value, contentType, entityGuid, field).subscribe(path => {
      if (!path) { return; }
      callback(path);
    });
  }

  private updateControl(control: AbstractControl, value: FieldValue) {
    if (control == null || control.disabled) { return; }

    if (control.value !== value) { control.patchValue(value); }
    this.validationMessagesService.markAsTouched(control);
    this.validationMessagesService.markAsDirty(control);
  }
}
