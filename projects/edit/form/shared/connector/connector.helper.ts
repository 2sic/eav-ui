import { ChangeDetectorRef, ElementRef, NgZone, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EavCustomInputField, ExperimentalProps, FieldConfig, FieldSettings, FieldValue } from '../../../../edit-types';
import { GeneralHelpers, InputFieldHelpers, PagePicker } from '../../../shared/helpers';
import { AdamService, EavService, EditRoutingService, FieldsSettingsService } from '../../../shared/services';
import { ContentTypeService, EntityCacheService, FeatureService, InputTypeService } from '../../../shared/store/ngrx-data';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { ConnectorHost, ConnectorInstance } from './connector-instance.model';

export class ConnectorHelper {
  private control: AbstractControl;
  private customEl: EavCustomInputField;
  private subscription: Subscription;
  private value$: BehaviorSubject<FieldValue>;
  private settings$: BehaviorSubject<FieldSettings>;

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
    private adamService: AdamService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private changeDetectorRef: ChangeDetectorRef,
    private fieldsSettingsService: FieldsSettingsService,
    private entityCacheService: EntityCacheService,
    private zone: NgZone,
  ) {
    this.control = this.group.controls[this.config.fieldName];
    this.subscription = new Subscription();
    this.value$ = new BehaviorSubject(this.control.value);
    this.subscription.add(
      this.control.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
        this.value$.next(value);
      })
    );
    this.settings$ = new BehaviorSubject(this.fieldsSettingsService.getFieldSettings(this.config.fieldName));
    this.subscription.add(
      this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).subscribe(settings => {
        this.settings$.next(settings);
      })
    );

    this.customEl = document.createElement(this.customElName) as EavCustomInputField;
    this.customEl.connector = this.buildConnector();
    this.customElContainerRef.nativeElement.appendChild(this.customEl);
  }

  destroy() {
    this.value$.complete();
    this.settings$.complete();
    this.subscription.unsubscribe();
    this.customEl?.parentNode.removeChild(this.customEl);
    this.customEl = null;
  }

  private buildConnector() {
    const connectorHost = this.calculateRegularProps();
    const experimental = this.calculateExperimentalProps();
    const settingsSnapshot = this.fieldsSettingsService.getFieldSettings(this.config.fieldName);
    const fieldConfig = this.getFieldConfig(settingsSnapshot);
    const fieldConfig$ = this.settings$.pipe(map(settings => this.getFieldConfig(settings)));
    const value$ = this.value$.asObservable();
    const connector = new ConnectorInstance(connectorHost, value$, fieldConfig, fieldConfig$, experimental, this.eavService.eavConfig);
    this.subscription.add(
      this.settings$.subscribe(settings => {
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
      openPagePicker: (callback) => {
        this.zone.run(() => {
          PagePicker.open(this.config, this.group, this.dialog, this.viewContainerRef, this.changeDetectorRef, callback);
        });
      },
      getUrlOfId: (value, callback) => {
        this.zone.run(() => { this.getUrlOfId(value, callback); });
      },
      getEntityCache: (guids?) => this.entityCacheService.getEntities(guids),
      getEntityCache$: (guids?) => this.entityCacheService.getEntities$(guids),
    };

    return experimentalProps;
  }

  private getFieldConfig(settings: FieldSettings): FieldConfig {
    const fieldConfig: FieldConfig = {
      name: this.config.fieldName,
      index: this.config.index,
      label: settings.Name,
      placeholder: settings.Placeholder,
      inputType: this.config.inputType,
      type: this.config.type,
      required: settings.Required,
      disabled: this.config.initialDisabled,
      settings,
    };
    return fieldConfig;
  }

  private getUrlOfId(value: string, callback: (value: string) => void) {
    if (!value) { return; }

    // handle short-ID links like file:17
    const contentType = this.config.contentTypeId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.adamService.getLinkInfo(value, contentType, entityGuid, field).subscribe(linkInfo => {
      if (!linkInfo) { return; }
      callback(linkInfo.Value);
    });
  }

  private updateControl(control: AbstractControl, value: FieldValue) {
    if (control.disabled) { return; }
    GeneralHelpers.patchControlValue(control, value);
  }
}
