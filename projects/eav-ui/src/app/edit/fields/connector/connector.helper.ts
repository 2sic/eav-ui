import { FieldValue } from './../../../../../../edit-types/src/FieldValue';
import { toFieldConfig } from './../../../../../../edit-types/src/FieldConfig';
import { ExperimentalProps } from './../../../../../../edit-types/src/ExperimentalProps';
import { ChangeDetectorRef, ElementRef, Injectable, Injector, NgZone, OnDestroy, ViewContainerRef, computed, effect, inject } from '@angular/core';
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
import isEqual from 'lodash-es/isEqual';

const logThis = false;
const nameOfThis = 'ConnectorHelper';

const logExperimental = true;
const nameOfExperimental = 'ConnectorHelperExperimental';

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

  #config = this.#fieldState.config;
  #group = this.#fieldState.group;

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
    this.#viewContainerRef = viewContainerRef;
    this.#changeDetectorRef = changeDetectorRef;

    this.#control = this.#group.controls[this.#config.fieldName];
    this.#value$ = new BehaviorSubject(this.#control.value);
    this.subscriptions.add(
      this.#control.valueChanges.pipe(distinctUntilChanged()).subscribe(value => {
        this.#value$.next(value);
      })
    );

    this.#customEl = document.createElement(customElName) as EavCustomInputField;
    this.#customEl.connector = this.#buildConnector();
    customElContainerRef.nativeElement.appendChild(this.#customEl);
    return this;
  }

  ngOnDestroy() {
    this.log.a('ngOnDestroy');
    this.#value$.complete();
    this.#customEl?.parentNode.removeChild(this.#customEl);
    this.#customEl = null;
    super.destroy();
  }

  #buildConnector() {
    const connectorHost = this.#getCallbacks();
    const experimental = this.#buildExperimentalProps();
    const fieldConfigSignal = computed(() => {
      const settings = this.#fieldState.settings();
      return toFieldConfig(this.#config, settings);
    }, { equal: isEqual});
    const value$ = this.#value$.asObservable();
    const connector = new ConnectorInstance(connectorHost, value$, fieldConfigSignal, experimental, this.#formConfig.config);

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
        this.#zone.run(() => this.#updateControl(this.#control, value));
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

    const lEx = new EavLogger(nameOfExperimental, logExperimental);

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
        this.#zone.run(() => { this.#updateControl(this.#group.controls[name], value); });
      },
      isFeatureEnabled$: (nameId) => this.#featuresService.isEnabled$(nameId),
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

  #updateControl(control: AbstractControl, value: FieldValue) {
    if (control.disabled) { return; }
    ControlHelpers.patchControlValue(control, value);
  }

  #openFeatureDisabledWarning(featureNameId: string) { 
    if (featureNameId === FeatureNames.PasteImageFromClipboard) {
      this.#snackBar.open(this.#translateService.instant('Message.PastingFilesIsNotEnabled'), this.#translateService.instant('Message.FindOutMore'), { duration: 3000 })
        .onAction()
        .subscribe(() => openFeatureDialog(this.#dialog, FeatureNames.PasteImageFromClipboard, this.#viewContainerRef, this.#changeDetectorRef));
    }
  }
}
