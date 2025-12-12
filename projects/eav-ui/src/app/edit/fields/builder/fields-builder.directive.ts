import { ComponentRef, Directive, ElementRef, OnDestroy, OnInit, Renderer2, Type, ViewContainerRef, effect, inject, signal, untracked } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { transient } from '../../../../../../core';
import { InputTypeCatalog } from '../../../shared/fields/input-type-catalog';
import { InputTypeHelpers } from '../../../shared/fields/input-type-helpers';
import { classLog } from '../../../shared/logging';
import { EntityFormStateService } from '../../entity-form/entity-form-state.service';
import { InputComponents } from '../../fields/input-components.constant';
import { FieldProps } from '../../state/fields-configs.model';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { CustomDefaultComponent } from '../basic/custom-default/custom-default';
import { FieldConfigSet } from '../field-config-set.model';
import { FieldMetadataKey, FieldMetadataModel } from '../field-metadata.decorator';
import { AdamConnector } from '../wrappers/adam/adam-browser/adam-connector';
import { PickerExpandableWrapperComponent } from '../wrappers/picker-dialog/picker-expandable-wrapper';
import { FieldStateInjectorFactory } from './field-injector.service';
import { InjectorBundle } from './injector-bundle.model';

const logSpecs = {
  all: false,
  createWrapper: true,
};

/**
 * This directive is responsible for creating the dynamic fields based on the field settings.
 * It will create the fields based on the settings and attach them to the view.
 */
@Directive({
  selector: '[appEditControlsBuilder]',
})
export class EditControlsBuilderDirective implements OnInit, OnDestroy {

  index: number;

  // In the class, inject Renderer2
  private renderer = inject(Renderer2);
  #firstInputFocused = false;

  log = classLog({ EditControlsBuilderDirective }, logSpecs);

  /** Service to create custom injectors for each field */
  #fieldInjectorFac = transient(FieldStateInjectorFactory);

  /** Ref to this HTML DOM, for adding controls */
  #myContainerRef = inject(ViewContainerRef);

  /** Service to get all settings for each field */
  #fieldsSettingsSvc = inject(FieldsSettingsService);

  constructor(private formConfigService: EntityFormStateService, private el: ElementRef) {
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
    // Get the Index from the HTML element attribute
    this.index = parseInt(this.el.nativeElement.getAttribute('data-index'));
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
    const componentRef = this.#generateAndAttachField(componentType, wrapperInfo.contentsRef, wrapperInfo.injectors);

    // generate the picker preview component if it exists
    const pickerPreviewContainerRef = (wrapperInfo.wrapperRef?.instance as PickerExpandableWrapperComponent)?.previewComponent;
    if (pickerPreviewContainerRef != null) {
      const previewType = this.#readComponentType(inputSpecs.inputType);
      this.log.a('createComponent - add preview', { previewType });
      this.#generateAndAttachField(previewType, pickerPreviewContainerRef, wrapperInfo.injectors);
    }
    // Set only the first input to be focused, if it is the first input
    if (this.#firstInputFocused === false && this.index === 0 && fieldProps.settings.noAutoFocus !== true) {
      this.#setAutoFocus(componentRef);
      this.#firstInputFocused = true;
    }
  }

  #setAutoFocus(componentRef: ComponentRef<any>) {
    setTimeout(() => {
      // Get the input element from the component
      const nativeElement = componentRef.location.nativeElement.querySelector('input');
      if (nativeElement) {
        this.renderer.setAttribute(nativeElement, 'autofocus', 'true');
        nativeElement?.focus(); // Focus the input element - with null check in case we're too early
      }
    }, 250); // Wait for the input to be created before focusing

  }

  #generateAndAttachField(componentType: Type<any>, container: ViewContainerRef, injectors: InjectorBundle): ComponentRef<any> {
    const componentRef = container.createComponent(componentType, injectors);

    // Prevent 'e' | 'E' (science notation) in <input type="number"> for "number-default"
    if (componentType === InputComponents['number-default']) {
      const inputEl = componentRef.location.nativeElement.querySelector('input[type="number"]');
      inputEl?.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key?.toLowerCase() === 'e') e.preventDefault();
      });
    }

    return componentRef;
  }

  #createWrappers(outerWrapper: DynamicControlInfo, wrappers: string[]): DynamicControlInfo {
    let wrapperInfo = outerWrapper;
    for (const wrapperName of wrappers)
      wrapperInfo = this.#createWrapper(wrapperInfo, wrapperName);
    return wrapperInfo;
  }

  #createWrapper(wrapperInfo: DynamicControlInfo, wrapperName: string): DynamicControlInfo {
    const l = this.log.fnIf('createWrapper', { wrapperName });
    const componentType = this.#readComponentType(wrapperName);
    const ref = wrapperInfo.contentsRef.createComponent(componentType, wrapperInfo.injectors);
    return new DynamicControlInfo(ref, ref.instance.fieldComponent, null /* no injectors for following wrappers */);
  }

  #readComponentType(selector: string): Type<any> {
    const componentType = InputComponents[selector];
    if (componentType != null)
      return componentType;

    console.error(`Missing component class for: ${selector}. This indicates that the field is not registered correctly, so the JS won't run. It could also mean that the JS runs, but doesn't correctly create the custom tag. Will show an info-error instead.`);
    return CustomDefaultComponent;
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
