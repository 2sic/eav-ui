import { ChangeDetectorRef, ElementRef, Injectable, Injector, NgZone, OnDestroy, ViewContainerRef, computed, effect, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import isEqual from 'lodash-es/isEqual';
import { distinctUntilChanged, startWith } from 'rxjs';
import { EavCustomInputField } from '../../../../../../edit-types/src/EavCustomInputField';
import { transient } from '../../../core';
import { FeatureNames } from '../../../features/feature-names';
import { FeaturesScopedService } from '../../../features/features-scoped.service';
import { openFeatureDialog } from '../../../features/shared/base-feature.component';
import { classLog } from '../../../shared/logging';
import { ServiceBase } from '../../../shared/services/service-base';
import { FormConfigService } from '../../form/form-config.service';
import { EditRoutingService } from '../../routing/edit-routing.service';
import { AdamService } from '../../shared/adam/adam.service';
import { ContentTypeService } from '../../shared/content-types/content-type.service';
import { UiControl } from '../../shared/controls/ui-control';
import { FieldMask } from '../../shared/helpers';
import { InputTypeService } from '../../shared/input-types/input-type.service';
import { FieldState } from '../field-state';
import { PagePicker } from '../page-picker/page-picker.helper';
import { ExperimentalProps } from './../../../../../../edit-types/src/ExperimentalProps';
import { toFieldConfig } from './../../../../../../edit-types/src/FieldConfig';
import { FieldValue } from './../../../../../../edit-types/src/FieldValue';
import { ConnectorHost, ConnectorInstance } from './connector-instance.model';

const logSpecs = {
  all: false,
  constructor: false,
  init: true,
  getUrlOfId: false,
  updateControl: false,
  openFeatureDisabledWarning: false,
};

@Injectable()
export class ConnectorHelper extends ServiceBase implements OnDestroy {
  
  log = classLog({ConnectorHelper}, logSpecs);
  
  #injector = inject(Injector);
  #fieldState = inject(FieldState);
  #formConfig = inject(FormConfigService);
  #translateService = inject(TranslateService);
  #contentTypeService = inject(ContentTypeService);
  #inputTypeService = inject(InputTypeService);
  #featuresService = inject(FeaturesScopedService);
  #editRoutingService = inject(EditRoutingService);
  #dialog = inject(MatDialog);
  #snackBar = inject(MatSnackBar);
  #zone = inject(NgZone);
  
  #adamService = transient(AdamService);

  constructor() {
    super();
    this.log.aIf('constructor')
  }

  #customEl: EavCustomInputField;
  #value$ = this.#fieldState.ui().control.valueChanges.pipe(startWith(this.#fieldState.uiValue()), distinctUntilChanged(isEqual));

  #config = this.#fieldState.config;
  #group = this.#fieldState.group;

  #viewContainerRef: ViewContainerRef;
  #changeDetectorRef: ChangeDetectorRef;

  public init(
    customElName: string,
    customElContainerRef: ElementRef,
    viewContainerRef: ViewContainerRef,
    changeDetectorRef: ChangeDetectorRef,
  ): this {
    this.log.a('init');
    this.#viewContainerRef = viewContainerRef;
    this.#changeDetectorRef = changeDetectorRef;
    this.#customEl = document.createElement(customElName) as EavCustomInputField;
    this.#customEl.connector = this.#buildConnector();
    customElContainerRef.nativeElement.appendChild(this.#customEl);
    return this;
  }

  ngOnDestroy() {
    this.log.a('ngOnDestroy');
    this.#customEl?.parentNode.removeChild(this.#customEl);
    this.#customEl = null;
    super.ngOnDestroy();
  }

  #buildConnector() {
    const connectorHost = this.#getCallbacks();
    const experimental = this.#buildExperimentalProps();
    const fieldConfigSignal = computed(() => {
      const settings = this.#fieldState.settings();
      return toFieldConfig(this.#config, settings);
    }, { equal: isEqual});
    const connector = new ConnectorInstance(connectorHost, this.#value$, fieldConfigSignal, experimental, this.#formConfig.config);

    effect(() => {
      const s = this.#fieldState.settings();
      const field = connector.field;
      field.settings = s;
      field.label = s.Name;
      field.placeholder = s.Placeholder;
      field.required = s.valueRequired;
    }, { injector: this.#injector });
    return connector;
  }

  #getCallbacks() {
    const connectorHost: ConnectorHost = {
      update: (value) => {
        this.#zone.run(() => this.#updateControl(value));
      },
      expand: (expand, componentTag) => {
        this.#zone.run(() => this.#editRoutingService.expand(expand, this.#config.index, this.#config.entityGuid, componentTag));
      },
    };
    return connectorHost;
  }

  #buildExperimentalProps() {
    const contentType = this.#contentTypeService.get(this.#config.contentTypeNameId);
    const allInputTypeNames = this.#inputTypeService.getAttributeInputTypes(contentType.Attributes);

    const lEx = classLog("ConnectorHelperExperimental");

    const experimentalProps: ExperimentalProps = {
      entityGuid: this.#config.entityGuid,
      allInputTypeNames,
      formGroup: this.#group,
      translateService: this.#translateService,
      isExpanded$: this.#editRoutingService.isExpanded$(this.#config.index, this.#config.entityGuid),
      dropzone: this.#config.dropzone,
      adam: this.#config.adam,
      updateField: (name, value) => {
        lEx.fn('updateField', { name, value });
        this.#zone.run(() => { this.#updateControl(value, this.#group.controls[name]); });
      },
      isFeatureEnabled: this.#featuresService.isEnabled,
      setFocused: (focused) => {
        lEx.fn('setFocused', { focused });
        this.#zone.run(() => { this.#config.focused$.next(focused); });
      },
      openPagePicker: (callback) => {
        lEx.fn('openPagePicker');
        this.#zone.run(() => {
          PagePicker.open(this.#config, this.#group, this.#dialog, this.#viewContainerRef, this.#changeDetectorRef, callback);
        });
      },
      featureDisabledWarning: (featureNameId) => {
        lEx.fn('featureDisabledWarning', { featureNameId });
        this.#zone.run(() => {
          this.#openFeatureDisabledWarning(featureNameId);
        });
      },
      getUrlOfId: (value, callback) => {
        lEx.fn('getUrlOfId', { value });
        this.#zone.run(() => { this.#getUrlOfId(value, callback); });
      },
      getSettings: (name) => this.#formConfig.config.settings?.Values[name],

      getFieldMask: (mask: string, name?: string) => {
        return transient(FieldMask, this.#injector).init(name, mask);
      },

      injector: this.#injector,
    };

    return experimentalProps;
  }

  #getUrlOfId(value: string, callback: (value: string) => void) {
    if (!value) return;

    // handle short-ID links like file:17
    const contentType = this.#config.contentTypeNameId;
    const entityGuid = this.#config.entityGuid;
    const field = this.#config.fieldName;
    this.#adamService.getLinkInfo(value, contentType, entityGuid, field).subscribe(linkInfo => {
      if (!linkInfo) return;
      callback(linkInfo.Value);
    });
  }

  #updateControl(value: FieldValue, control: AbstractControl = null) {
    const ui = control ? new UiControl(control) : this.#fieldState.ui();
    if (ui.disabled) return;
    this.#fieldState.ui().setIfChanged(value);
  }

  #openFeatureDisabledWarning(featureNameId: string) { 
    if (featureNameId === FeatureNames.PasteImageFromClipboard) {
      this.#snackBar.open(this.#translateService.instant('Message.PastingFilesIsNotEnabled'), this.#translateService.instant('Message.FindOutMore'), { duration: 3000 })
        .onAction()
        .subscribe(() => openFeatureDialog(this.#dialog, FeatureNames.PasteImageFromClipboard, this.#viewContainerRef, this.#changeDetectorRef));
    }
  }
}
