import { FieldValue } from './../../../../../../edit-types/src/FieldValue';
import { FieldConfig, toFieldConfig } from './../../../../../../edit-types/src/FieldConfig';
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
import { FieldState } from '../field-state';
import { PagePicker } from '../page-picker/page-picker.helper';
import { transient } from '../../../core';
import { FeatureNames } from '../../../features/feature-names';
import { openFeatureDialog } from '../../../features/shared/base-feature.component';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { FeaturesService } from '../../../features/features.service';
import { ServiceBase } from '../../../shared/services/service-base';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FormConfigService } from '../../state/form-config.service';
import { EditRoutingService } from '../../shared/services/edit-routing.service';
import { AdamService } from '../../shared/services/adam.service';
import { ContentTypeService } from '../../shared/store/content-type.service';
import { InputTypeService } from '../../shared/store/input-type.service';

const logThis = false;
const nameOfThis = 'ConnectorHelper';

@Injectable()
export class ConnectorHelper extends ServiceBase implements OnDestroy {
  
  #injector = inject(Injector);
  #fieldState = inject(FieldState);
  #formConfig = inject(FormConfigService);
  #translateService = inject(TranslateService);
  #contentTypeService = inject(ContentTypeService);
  #inputTypeService = inject(InputTypeService);
  #featuresService = inject(FeaturesService);
  #editRoutingService = inject(EditRoutingService);
  #dialog = inject(MatDialog);
  #fieldsSettingsService = inject(FieldsSettingsService);
  #snackBar = inject(MatSnackBar);
  #zone = inject(NgZone);
  
  #adamService = transient(AdamService);

  #control: AbstractControl;
  #customEl: EavCustomInputField;
  #value$: BehaviorSubject<FieldValue>;
  #settings$ = this.#fieldState.settings$;

  #config = this.#fieldState.config;
  #group = this.#fieldState.group;

  #customElContainerRef: ElementRef;
  #customElName: string;

  #viewContainerRef: ViewContainerRef;
  #changeDetectorRef: ChangeDetectorRef;

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
    this.#customElContainerRef = customElContainerRef;
    this.#customElName = customElName;

    this.#viewContainerRef = viewContainerRef;
    this.#changeDetectorRef = changeDetectorRef;

    this.#control = this.#group.controls[this.#config.fieldName];
    this.#value$ = new BehaviorSubject(this.#control.value);
    this.subscriptions.add(
      this.#control.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
        this.#value$.next(value);
      })
    );

    this.#customEl = document.createElement(this.#customElName) as EavCustomInputField;
    this.#customEl.connector = this.buildConnector();
    this.#customElContainerRef.nativeElement.appendChild(this.#customEl);
    return this;
  }

  ngOnDestroy() {
    this.log.a('ngOnDestroy');
    this.#value$.complete();
    this.#customEl?.parentNode.removeChild(this.#customEl);
    this.#customEl = null;
    super.destroy();
  }

  private buildConnector() {
    const connectorHost = this.calculateRegularProps();
    const experimental = this.calculateExperimentalProps();
    const settingsSnapshot = this.#fieldsSettingsService.getFieldSettings(this.#config.fieldName);
    const fieldConfig = toFieldConfig(this.#config, settingsSnapshot);
    const fieldConfig$ = this.#settings$.pipe(map(settings => toFieldConfig(this.#config, settings)));
    const value$ = this.#value$.asObservable();
    const connector = new ConnectorInstance(connectorHost, value$, fieldConfig, fieldConfig$, experimental, this.#formConfig.config);
    this.subscriptions.add(
      this.#settings$.subscribe(settings => {
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
        this.#zone.run(() => this.updateControl(this.#control, value));
      },
      expand: (expand, componentTag) => {
        this.#zone.run(() => {
          this.#editRoutingService.expand(expand, this.#config.index, this.#config.entityGuid, componentTag);
        });
      },
    };
    return connectorHost;
  }

  private calculateExperimentalProps() {
    const contentType = this.#contentTypeService.get(this.#config.contentTypeNameId);
    const allInputTypeNames = this.#inputTypeService.getAttributeInputTypes(contentType.Attributes);

    const experimentalProps: ExperimentalProps = {
      entityGuid: this.#config.entityGuid,
      allInputTypeNames,
      formGroup: this.#group,
      translateService: this.#translateService,
      isExpanded$: this.#editRoutingService.isExpanded$(this.#config.index, this.#config.entityGuid),
      dropzone: this.#config.dropzone,
      adam: this.#config.adam,
      updateField: (name, value) => {
        this.#zone.run(() => { this.updateControl(this.#group.controls[name], value); });
      },
      isFeatureEnabled$: (nameId) => this.#featuresService.isEnabled$(nameId),
      setFocused: (focused) => {
        this.#zone.run(() => { this.#config.focused$.next(focused); });
      },
      openPagePicker: (callback) => {
        this.#zone.run(() => {
          PagePicker.open(this.#config, this.#group, this.#dialog, this.#viewContainerRef, this.#changeDetectorRef, callback);
        });
      },
      featureDisabledWarning: (featureNameId) => {
        this.#zone.run(() => {
          this.openFeatureDisabledWarning(featureNameId);
        });
      },
      getUrlOfId: (value, callback) => {
        this.#zone.run(() => { this.getUrlOfId(value, callback); });
      },
      getSettings: (name) => this.#formConfig.config.settings?.Values[name],

      getFieldMask: (mask: string, name?: string) => {
        return transient(FieldMask, this.#injector).init(name, mask);
      },
    };

    return experimentalProps;
  }

  private getUrlOfId(value: string, callback: (value: string) => void) {
    if (!value) { return; }

    // handle short-ID links like file:17
    const contentType = this.#config.contentTypeNameId;
    const entityGuid = this.#config.entityGuid;
    const field = this.#config.fieldName;
    this.#adamService.getLinkInfo(value, contentType, entityGuid, field).subscribe(linkInfo => {
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
      this.#snackBar.open(this.#translateService.instant('Message.PastingFilesIsNotEnabled'), this.#translateService.instant('Message.FindOutMore'), { duration: 3000 })
        .onAction()
        .subscribe(() => openFeatureDialog(this.#dialog, FeatureNames.PasteImageFromClipboard, this.#viewContainerRef, this.#changeDetectorRef));
    }
  }
}
