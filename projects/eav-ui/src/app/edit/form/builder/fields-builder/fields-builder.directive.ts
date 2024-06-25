import { Directive, OnDestroy, OnInit, Type, ViewContainerRef, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldMetadataKey } from '../../../shared/constants';
import { FieldMetadataModel, FieldProps } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { CustomDefaultComponent } from '../../fields/custom/custom-default/custom-default.component';
import { PickerExpandableWrapperComponent } from '../../wrappers/picker-expandable-wrapper/picker-expandable-wrapper.component';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';
import { Field } from './field.model';
import { EmptyFieldHelpers } from '../../fields/empty/empty-field-helpers';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { InputComponents } from './input-components.constant';
import { InjectorBundle } from './injector-bundle.model';
import { DynamicControlInfo } from './dynamic-control-info.model';
import { FieldInjectorService } from './field-injector.service';

const logThis = false;
const nameOfThis = 'FieldsBuilderDirective';

/**
 * This directive is responsible for creating the dynamic fields based on the field settings.
 * It will create the fields based on the settings and attach them to the view.
 */
@Directive({
  selector: '[appFieldsBuilder]',
  standalone: true,
  providers: [FieldInjectorService],
})
export class FieldsBuilderDirective extends ServiceBase implements OnInit, OnDestroy {
  
  /** Service to create custom injectors for each field */
  private fieldInjector = inject(FieldInjectorService);
  
  /** Ref to this HTML DOM, for adding controls */
  private thisContainerRef = inject(ViewContainerRef);

  /** Service to get all settings for each field */
  private fieldsSettingsService = inject(FieldsSettingsService);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }
  
  private fieldConfigs: FieldConfigSet[] = [];

  ngOnInit() {
    // clear container
    this.thisContainerRef.clear();

    // Set the current container to be "This" = the main container (not a specific group)
    // When groups open/close, this will be set to that group,
    // so fields are then inside that container.
    let currentContainer = this.thisContainerRef;
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();

    // Loop through each field and create the component
    // If we encounter a group, we create a new container and set it as the main one
    for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
      const fieldConfig: FieldConfigSet = {
        ...fieldProps.constants,
        name: fieldName,
        focused$: new BehaviorSubject(false),
      };
      this.fieldConfigs.push(fieldConfig);
      const inputType = fieldProps.calculatedInputType.inputType;

      // If we encounter a group-start, then create a new container based on the main container
      if (EmptyFieldHelpers.isGroupStart(inputType))
        currentContainer = this.createGroup(this.thisContainerRef, fieldProps, fieldConfig);
      // If we encounter a group-end, set the main container to be the default one again
      else if (EmptyFieldHelpers.isGroupEnd(inputType))
        currentContainer = this.thisContainerRef;
      // Just create the normal component within the current container
      else
        this.createComponent(currentContainer, fieldProps, fieldConfig);
    }
  }

  ngOnDestroy(): void {
    for (const fieldConfig of this.fieldConfigs)
      fieldConfig.focused$.complete();
    this.destroy();
  }

  private createGroup(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet): ViewContainerRef {
    const injectors = this.fieldInjector.getInjectors(fieldConfig, fieldProps.calculatedInputType);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.wrappers);
    return wrapperInfo.contentsRef;
  }

  private createComponent(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet) {
    this.log.a('createComponent', [fieldProps.calculatedInputType]);

    // Add injector to first wrapper, so that it will be attached to the top level, and then dropped
    const injectors = this.fieldInjector.getInjectors(fieldConfig, fieldProps.calculatedInputType);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.wrappers);

    const componentType = fieldProps.calculatedInputType.isExternal
      ? this.readComponentType(InputTypeConstants.ExternalWebComponent)
      : this.readComponentType(fieldProps.calculatedInputType.inputType);

    // create component - ideally with metadata if provided (ATM can specify alternate wrapper)
    // New 2024-06-11 will not break if metadata not specified
    const fieldMetadata: FieldMetadataModel = Reflect.getMetadata(FieldMetadataKey, componentType);

    // generate wrappers if they are defined
    if (fieldMetadata?.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldMetadata.wrappers);

    // generate the real input field component
    this.log.a('createComponent - add component', [componentType]);
    this.generateAndAttachField(componentType, wrapperInfo.contentsRef, wrapperInfo.injectors, false);

    // generate the picker preview component if it exists
    const pickerPreviewContainerRef = (wrapperInfo.wrapperRef?.instance as PickerExpandableWrapperComponent)?.previewComponent;
    if (pickerPreviewContainerRef != null) {
      const previewType = this.readComponentType(fieldProps.calculatedInputType.inputType);
      this.log.a('createComponent - add preview', [previewType]);
      this.generateAndAttachField(previewType, pickerPreviewContainerRef, wrapperInfo.injectors, true);
    }
  }

  private generateAndAttachField(componentType: Type<any>, container: ViewContainerRef, injectors: InjectorBundle, isPreview: boolean) {

    const realFieldRef = container.createComponent(componentType, injectors);
    // used for passing data to controls when fields have multiple controls (e.g. field and a preview)
    const controlConfig: FieldControlConfig = { isPreview };
    Object.assign<Field, Field>(realFieldRef.instance, {
      controlConfig,
    } as any);
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
