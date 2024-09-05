import { Directive, OnDestroy, OnInit, Type, ViewContainerRef, effect, inject, signal, untracked } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { CustomDefaultComponent } from '../basic/custom-default/custom-default.component';
import { PickerExpandableWrapperComponent } from '../../fields/wrappers/picker-dialog/picker-expandable-wrapper.component';
import { InputComponents } from '../../fields/input-components.constant';
import { InjectorBundle } from './injector-bundle.model';
import { DynamicControlInfo } from './dynamic-control-info.model';
import { FieldInjectorService } from './field-injector.service';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { transient } from '../../../core';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { FieldConfigSet } from '../field-config-set.model';
import { FieldMetadataKey, FieldMetadataModel } from '../field-metadata.decorator';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldProps } from '../../state/fields-configs.model';
import { EntityFormStateService } from '../../entity-form/entity-form-state.service';
import { AdamConnector } from '../wrappers/adam/adam-browser/adam-connector';

const logSpecs = {
  enabled: false,
  name: 'EditControlsBuilderDirective',
};


/**
 * This directive is responsible for creating the dynamic fields based on the field settings.
 * It will create the fields based on the settings and attach them to the view.
 */
@Directive({
  selector: '[appEditControlsBuilder]',
  standalone: true,
})
export class EditControlsBuilderDirective  implements OnInit, OnDestroy {

  /** Service to create custom injectors for each field */
  #fieldInjector = transient(FieldInjectorService);

  /** Ref to this HTML DOM, for adding controls */
  #thisContainerRef = inject(ViewContainerRef);

  /** Service to get all settings for each field */
  #fieldsSettingsService = inject(FieldsSettingsService);

  log = new EavLogger(logSpecs);
  constructor(private formConfigService: EntityFormStateService) {
    effect(() => {
      const onInitReady = this.onInitReady();
      const controlsCreated = this.formConfigService.controlsCreated();
      this.log.a('createControls - effect', { onInitReady, controlsCreated });
      if (!(onInitReady && controlsCreated))
        return;

      this.log.a('createControls RUN');
      // TODO: NOT YET CLEAR IF THIS IS THE RIGHT SOLUTION
      untracked(() => this.createControls());
    }); // , { allowSignalWrites: true });
  }

  /** Field Configs for clean-up after the control closes */
  #fieldConfigSets: FieldConfigSet[] = [];

  onInitReady = signal(false);

  ngOnInit() {
    this.onInitReady.set(true);
  }

  createControls() {
    // clear container
    this.#thisContainerRef.clear();

    // Set the current container to be "This" = the main container (not a specific group)
    // When groups open/close, this will be set to that group,
    // so fields are then inside that container.
    let currentContainer = this.#thisContainerRef;
    const fieldsProps = this.#fieldsSettingsService.getFieldsProps();

    // Loop through each field and create the component
    // If we encounter a group, we create a new container and set it as the main one
    for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
      const fieldConfig: FieldConfigSet = {
        ...fieldProps.constants,
        fieldName: fieldName,
        focused$: new BehaviorSubject(false),
        adam: new AdamConnector(),
      };
      this.#fieldConfigSets.push(fieldConfig);
      const inputType = fieldProps.constants.inputTypeSpecs.inputType;

      // If we encounter a group-start, then create a new container based on the main container
      if (InputTypeHelpers.isGroupStart(inputType))
        currentContainer = this.createGroup(this.#thisContainerRef, fieldProps, fieldConfig);
      // If we encounter a group-end, set the main container to be the default one again
      else if (InputTypeHelpers.isGroupEnd(inputType))
        currentContainer = this.#thisContainerRef;
      // Just create the normal component within the current container
      else
        this.createComponent(currentContainer, fieldProps, fieldConfig);
    }
  }

  ngOnDestroy(): void {
    for (const fieldConfig of this.#fieldConfigSets)
      fieldConfig.focused$.complete();
  }

  private createGroup(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet): ViewContainerRef {
    const injectors = this.#fieldInjector.getInjectors(fieldConfig, fieldProps.constants.inputTypeSpecs);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.buildWrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.buildWrappers);
    return wrapperInfo.contentsRef;
  }

  private createComponent(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet) {
    this.log.a('createComponent', { inputTypeSpecs: fieldProps.constants.inputTypeSpecs });

    // Add injector to first wrapper, so that it will be attached to the top level, and then dropped
    const injectors = this.#fieldInjector.getInjectors(fieldConfig, fieldProps.constants.inputTypeSpecs);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.buildWrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.buildWrappers);

    const componentType = fieldProps.constants.inputTypeSpecs.isExternal
      ? this.readComponentType(InputTypeCatalog.ExternalWebComponent)
      : this.readComponentType(fieldProps.constants.inputTypeSpecs.inputType);

    // create component - ideally with metadata if provided (ATM can specify alternate wrapper)
    // New 2024-06-11 will not break if metadata not specified
    const fieldMetadata: FieldMetadataModel = Reflect.getMetadata(FieldMetadataKey, componentType);

    // generate wrappers if they are defined
    if (fieldMetadata?.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldMetadata.wrappers);

    // generate the real input field component
    // this.log.a('createComponent - add component', { componentType });
    this.generateAndAttachField(componentType, wrapperInfo.contentsRef, wrapperInfo.injectors);

    // generate the picker preview component if it exists
    const pickerPreviewContainerRef = (wrapperInfo.wrapperRef?.instance as PickerExpandableWrapperComponent)?.previewComponent;
    if (pickerPreviewContainerRef != null) {
      const previewType = this.readComponentType(fieldProps.constants.inputTypeSpecs.inputType);
      this.log.a('createComponent - add preview', { previewType });
      this.generateAndAttachField(previewType, pickerPreviewContainerRef, wrapperInfo.injectors);
    }
  }

  private generateAndAttachField(componentType: Type<any>, container: ViewContainerRef, injectors: InjectorBundle) {
    container.createComponent(componentType, injectors);
  }

  private createWrappers(outerWrapper: DynamicControlInfo, wrappers: string[]): DynamicControlInfo {
    let wrapperInfo = outerWrapper;
    for (const wrapperName of wrappers)
      wrapperInfo = this.createWrapper(wrapperInfo, wrapperName);
    return wrapperInfo;
  }

  private createWrapper(wrapperInfo: DynamicControlInfo, wrapperName: string): DynamicControlInfo {
    const componentType = this.readComponentType(wrapperName);
    const ref = wrapperInfo.contentsRef.createComponent(componentType, wrapperInfo.injectors);
    return new DynamicControlInfo(ref, ref.instance.fieldComponent, null /* no injectors for following wrappers */);
  }

  private readComponentType(selector: string): Type<any> {
    const componentType = InputComponents[selector];
    if (componentType == null) {
      console.error(`Missing component class for: ${selector}`);
      return CustomDefaultComponent;
    }
    return componentType;
  }

}
