import { FieldValue } from './../../../../../../edit-types/src/FieldValue';
import { FieldConfig } from './../../../../../../edit-types/src/FieldConfig';
import { FieldSettings } from './../../../../../../edit-types/src/FieldSettings';
import { ExperimentalProps } from './../../../../../../edit-types/src/ExperimentalProps';
import { ChangeDetectorRef, ElementRef, Injectable, Injector, NgZone, OnDestroy, ViewContainerRef, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { ConnectorHost, ConnectorInstance } from './connector-instance.model';
import { EavCustomInputField } from '../../../../../../edit-types/src/EavCustomInputField';
import { FieldMask } from '../../shared/helpers';
import { ControlHelpers } from '../../shared/helpers/control.helpers';
import { ContentTypeService, InputTypeService } from '../../shared/store/ngrx-data';
import { FieldState } from '../field-state';
import { PagePicker } from '../page-picker/page-picker.helper';
import { transient } from '../../../core';
import { FeatureNames } from '../../../features/feature-names';
import { openFeatureDialog } from '../../../features/shared/base-feature.component';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { FeaturesService } from '../../../shared/services/features.service';
import { ServiceBase } from '../../../shared/services/service-base';
import { FieldsSettingsService } from '../../services/state/fields-settings.service';
import { FormConfigService } from '../../services/state/form-config.service';
import { EditRoutingService } from '../../shared/services/edit-routing.service';
import { AdamService } from '../../shared/services/adam.service';

const logThis = false;
const nameOfThis = 'ConnectorHelper';

@Injectable()
export class ConnectorHelper extends ServiceBase implements OnDestroy {
  
  private injector = inject(Injector);
  private fieldState = inject(FieldState);

  private control: AbstractControl;
  private customEl: EavCustomInputField;
  private value$: BehaviorSubject<FieldValue>;
  private settings$ = this.fieldState.settings$;

  private config = this.fieldState.config;
  private group = this.fieldState.group;

  private customElContainerRef: ElementRef;
  private customElName: string;

  private formConfig = inject(FormConfigService);
  private translateService = inject(TranslateService);
  private contentTypeService = inject(ContentTypeService);

  private inputTypeService = inject(InputTypeService);
  private featuresService = inject(FeaturesService);
  private editRoutingService = inject(EditRoutingService);
  private adamService = inject(AdamService);
  private dialog = inject(MatDialog);

  private viewContainerRef: ViewContainerRef;
  private changeDetectorRef: ChangeDetectorRef;
  private fieldsSettingsService = inject(FieldsSettingsService);
  private snackBar = inject(MatSnackBar);
  private zone = inject(NgZone);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
    this.log.a('constructor')
  }

  public init(
    customElName: string,
    customElContainerRef: ElementRef,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
  ): this {
    this.log.a('init');
    this.customElContainerRef = customElContainerRef;
    this.customElName = customElName;

    this.viewContainerRef = viewContainerRef;
    this.changeDetectorRef = changeDetectorRef;

    this.control = this.group.controls[this.config.fieldName];
    this.value$ = new BehaviorSubject(this.control.value);
    this.subscriptions.add(
      this.control.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
        this.value$.next(value);
      })
    );

    this.customEl = document.createElement(this.customElName) as EavCustomInputField;
    this.customEl.connector = this.buildConnector();
    this.customElContainerRef.nativeElement.appendChild(this.customEl);
    return this;
  }

  ngOnDestroy() {
    this.log.a('ngOnDestroy');
    this.value$.complete();
    this.customEl?.parentNode.removeChild(this.customEl);
    this.customEl = null;
    super.destroy();
  }

  private buildConnector() {
    const connectorHost = this.calculateRegularProps();
    const experimental = this.calculateExperimentalProps();
    const settingsSnapshot = this.fieldsSettingsService.getFieldSettings(this.config.fieldName);
    const fieldConfig = this.getFieldConfig(settingsSnapshot);
    const fieldConfig$ = this.settings$.pipe(map(settings => this.getFieldConfig(settings)));
    const value$ = this.value$.asObservable();
    const connector = new ConnectorInstance(connectorHost, value$, fieldConfig, fieldConfig$, experimental, this.formConfig.config);
    this.subscriptions.add(
      this.settings$.subscribe(settings => {
        connector.field.settings = settings;
        connector.field.label = settings.Name;
        connector.field.placeholder = settings.Placeholder;
        connector.field.required = settings._currentRequired;
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
    const contentType = this.contentTypeService.getContentType(this.config.contentTypeNameId);
    const inputTypes = this.inputTypeService.getInputTypes();
    const allInputTypeNames = this.inputTypeService.getInputTypeNames(contentType.Attributes);

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
      isFeatureEnabled$: (nameId) => this.featuresService.isEnabled$(nameId),
      setFocused: (focused) => {
        this.zone.run(() => { this.config.focused$.next(focused); });
      },
      openPagePicker: (callback) => {
        this.zone.run(() => {
          PagePicker.open(this.config, this.group, this.dialog, this.viewContainerRef, this.changeDetectorRef, callback);
        });
      },
      featureDisabledWarning: (featureNameId) => {
        this.zone.run(() => {
          this.openFeatureDisabledWarning(featureNameId);
        });
      },
      getUrlOfId: (value, callback) => {
        this.zone.run(() => { this.getUrlOfId(value, callback); });
      },
      getSettings: (name) => this.formConfig.config.settings?.Values[name],
      // 2024-04-26 2dm removed this, don't think it's used and believe it's a leftover #cleanup-picker
      // getEntityCache: (guids?) => this.entityCacheService.getEntities(guids),
      // getEntityCache$: (guids?) => this.entityCacheService.getEntities$(guids),

      getFieldMask: (mask: string, name?: string, watch?: boolean) => {
        return transient(FieldMask, this.injector).init(name, mask, watch);
      },
    };

    return experimentalProps;
  }

  private getFieldConfig(settings: FieldSettings): FieldConfig {
    const fieldConfig: FieldConfig = {
      name: this.config.fieldName,
      index: this.config.index,
      label: settings.Name,
      placeholder: settings.Placeholder,
      inputType: this.config.inputTypeStrict,
      type: this.config.type,
      required: settings._currentRequired,
      disabled: this.config.initialDisabled,
      settings,
    };
    return fieldConfig;
  }

  private getUrlOfId(value: string, callback: (value: string) => void) {
    if (!value) { return; }

    // handle short-ID links like file:17
    const contentType = this.config.contentTypeNameId;
    const entityGuid = this.config.entityGuid;
    const field = this.config.fieldName;
    this.adamService.getLinkInfo(value, contentType, entityGuid, field).subscribe(linkInfo => {
      if (!linkInfo) { return; }
      callback(linkInfo.Value);
    });
  }

  private updateControl(control: AbstractControl, value: FieldValue) {
    if (control.disabled) { return; }
    ControlHelpers.patchControlValue(control, value);
  }

  private openFeatureDisabledWarning(featureNameId: string) { 
    if (featureNameId === FeatureNames.PasteImageFromClipboard) {
      this.snackBar.open(this.translateService.instant('Message.PastingFilesIsNotEnabled'), this.translateService.instant('Message.FindOutMore'), { duration: 3000 })
        .onAction()
        .subscribe(() => openFeatureDialog(this.dialog, FeatureNames.PasteImageFromClipboard, this.viewContainerRef, this.changeDetectorRef));
    }
  }
}
