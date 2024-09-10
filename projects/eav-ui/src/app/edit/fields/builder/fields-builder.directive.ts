import { ComponentRef, Directive, OnDestroy, OnInit, Type, ViewContainerRef, effect, inject, signal, untracked } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { CustomDefaultComponent } from '../basic/custom-default/custom-default.component';
import { PickerExpandableWrapperComponent } from '../../fields/wrappers/picker-dialog/picker-expandable-wrapper.component';
import { InputComponents } from '../../fields/input-components.constant';
import { InjectorBundle } from './injector-bundle.model';
import { FieldStateInjectorFactory } from './field-injector.service';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { transient } from '../../../core';
import { FieldConfigSet } from '../field-config-set.model';
import { FieldMetadataKey, FieldMetadataModel } from '../field-metadata.decorator';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldProps } from '../../state/fields-configs.model';
import { EntityFormStateService } from '../../entity-form/entity-form-state.service';
import { AdamConnector } from '../wrappers/adam/adam-browser/adam-connector';
import { classLog } from '../../../shared/logging';

/**
 * This directive is responsible for creating the dynamic fields based on the field settings.
 * It will create the fields based on the settings and attach them to the view.
 */
@Directive({
  selector: '[appEditControlsBuilder]',
  standalone: true,
})
export class EditControlsBuilderDirective  implements OnInit, OnDestroy {

  log = classLog({EditControlsBuilderDirective});

  /** Service to create custom injectors for each field */
  #fieldInjectorFac = transient(FieldStateInjectorFactory);

  /** Ref to this HTML DOM, for adding controls */
  #myContainerRef = inject(ViewContainerRef);

  /** Service to get all settings for each field */
  #fieldsSettingsSvc = inject(FieldsSettingsService);

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
    });
  }

  /** Field Configs for clean-up after the control closes */
  #fieldConfigSets: FieldConfigSet[] = [];

  onInitReady = signal(false);

  ngOnInit() {
    this.onInitReady.set(true);
  }

  createControls() {
    // clear container
    this.#myContainerRef.clear();

    // Set the current container to be "This" = the main container (not a specific group)
    // When groups open/close, this will be set to that group,
    // so fields are then inside that container.
    let currentContainer = this.#myContainerRef;
    const fieldsProps = this.#fieldsSettingsSvc.allProps();

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

      if (InputTypeHelpers.isGroupStart(inputType)) {
        // If we encounter a group-start, then create a new container based on the main container
        currentContainer = this.#createGroup(this.#myContainerRef, fieldProps, fieldConfig);
      } else if (InputTypeHelpers.isGroupEnd(inputType)) {
        // If we encounter a group-end, set the main container to be the default one again
        currentContainer = this.#myContainerRef;
      } else {
        // Just create the normal component within the current container
        this.#createComponent(currentContainer, fieldProps, fieldConfig);
      }
    }
  }

  ngOnDestroy(): void {
    for (const fieldConfig of this.#fieldConfigSets)
      fieldConfig.focused$.complete();
  }

  #createGroup(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet): ViewContainerRef {
    const injectors = this.#fieldInjectorFac.getInjectors(fieldConfig, fieldProps.constants.inputTypeSpecs);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.buildWrappers)
      wrapperInfo = this.#createWrappers(wrapperInfo, fieldProps.buildWrappers);
    return wrapperInfo.contentsRef;
  }

  #createComponent(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet) {
    const inputSpecs = fieldProps.constants.inputTypeSpecs;
    this.log.a('createComponent', { inputSpecs });

    // Add injector to first wrapper, so that it will be attached to the top level, and then dropped
    const injectors = this.#fieldInjectorFac.getInjectors(fieldConfig, inputSpecs);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.buildWrappers)
      wrapperInfo = this.#createWrappers(wrapperInfo, fieldProps.buildWrappers);

    const componentName = inputSpecs.isExternal ? InputTypeCatalog.ExternalWebComponent : inputSpecs.inputType;
    const componentType = this.#readComponentType(componentName);

    // create component - ideally with metadata if provided (ATM can specify alternate wrapper)
    const componentMd: FieldMetadataModel = Reflect.getMetadata(FieldMetadataKey, componentType);

    // generate wrappers if they are defined
    if (componentMd?.wrappers)
      wrapperInfo = this.#createWrappers(wrapperInfo, componentMd.wrappers);

    // generate the real input field component
    // this.log.a('createComponent - add component', { componentType });
    this.#generateAndAttachField(componentType, wrapperInfo.contentsRef, wrapperInfo.injectors);

    // generate the picker preview component if it exists
    const pickerPreviewContainerRef = (wrapperInfo.wrapperRef?.instance as PickerExpandableWrapperComponent)?.previewComponent;
    if (pickerPreviewContainerRef != null) {
      const previewType = this.#readComponentType(inputSpecs.inputType);
      this.log.a('createComponent - add preview', { previewType });
      this.#generateAndAttachField(previewType, pickerPreviewContainerRef, wrapperInfo.injectors);
    }
  }

  #generateAndAttachField(componentType: Type<any>, container: ViewContainerRef, injectors: InjectorBundle) {
    container.createComponent(componentType, injectors);
  }

  #createWrappers(outerWrapper: DynamicControlInfo, wrappers: string[]): DynamicControlInfo {
    let wrapperInfo = outerWrapper;
    for (const wrapperName of wrappers)
      wrapperInfo = this.#createWrapper(wrapperInfo, wrapperName);
    return wrapperInfo;
  }

  #createWrapper(wrapperInfo: DynamicControlInfo, wrapperName: string): DynamicControlInfo {
    const componentType = this.#readComponentType(wrapperName);
    const ref = wrapperInfo.contentsRef.createComponent(componentType, wrapperInfo.injectors);
    return new DynamicControlInfo(ref, ref.instance.fieldComponent, null /* no injectors for following wrappers */);
  }

  #readComponentType(selector: string): Type<any> {
    const componentType = InputComponents[selector];
    if (componentType == null) {
      console.error(`Missing component class for: ${selector}`);
      return CustomDefaultComponent;
    }
    return componentType;
  }

}


class DynamicControlInfo {
  constructor(
    public wrapperRef: ComponentRef<any>,
    public contentsRef: ViewContainerRef,
    // will only need to be set the first time
    public injectors: InjectorBundle,
  ) { }
}
