import { Directive, Input, OnDestroy, OnInit, Type, ViewContainerRef, inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldMetadataKey } from '../../../shared/constants';
import { FieldMetadataModel, FieldProps } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { CustomDefaultComponent } from '../../fields/custom/custom-default/custom-default.component';
import { PickerExpandableWrapperComponent } from '../../wrappers/picker-expandable-wrapper/picker-expandable-wrapper.component';
import { FieldConfigSet, FieldControlConfig } from './field-config-set.model';
import { FieldWrapper } from './field-wrapper.model';
import { Field } from './field.model';
import { EmptyFieldHelpers } from '../../fields/empty/empty-field-helpers';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { InputComponents } from './input-components.constant';
import { InjectorBundle } from './injector-bundle.model';
import { DynamicControlInfo } from './dynamic-control-info.model';
import { FieldInjectorService } from './field-injector.service';

const logThis = false;

@Directive({
  selector: '[appFieldsBuilder]',
  standalone: true,
  providers: [FieldInjectorService],
})
export class FieldsBuilderDirective extends ServiceBase implements OnInit, OnDestroy {
  @Input() group: UntypedFormGroup;
  
  private fieldInjector = inject(FieldInjectorService);
  
  private fieldConfigs: FieldConfigSet[] = [];

  constructor(
    private mainContainerRef: ViewContainerRef,
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    super(new EavLogger('FieldsBuilderDirective', logThis));
  }

  ngOnInit() {
    // clear container
    this.mainContainerRef.clear();

    // Set the current wrapper to be the main one (not a specific group)
    let currentContainer = this.mainContainerRef;
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

      if (EmptyFieldHelpers.isGroupStart(inputType)) {
        // If we encounter an empty-start (group-start) then create a new container based on the main container
        currentContainer = this.createGroup(this.mainContainerRef, fieldProps, fieldConfig);
      } else if (EmptyFieldHelpers.isGroupEnd(inputType)) {
        // If we encounter a group-end, set the main container to be the default one again
        currentContainer = this.mainContainerRef;
      } else {
        // Just create the normal component within the current container
        this.createComponent(currentContainer, fieldProps, fieldConfig);
      }
    }
  }

  ngOnDestroy(): void {
    for (const fieldConfig of this.fieldConfigs)
      fieldConfig.focused$.complete();
  }

  private createGroup(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet): ViewContainerRef {
    let wrapperInfo = new DynamicControlInfo(null, containerRef);
    if (fieldProps.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.wrappers, fieldConfig);
    return wrapperInfo.contentsRef;
  }

  private createComponent(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet) {
    this.log.a('createComponent', [fieldProps.calculatedInputType]);

    // Add injector to first wrapper, so that it will be attached to the top level, and then dropped
    const injectors = this.fieldInjector.getInjectors(fieldConfig, false);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.wrappers, fieldConfig);

    const componentType = fieldProps.calculatedInputType.isExternal
      ? this.readComponentType(InputTypeConstants.ExternalWebComponent)
      : this.readComponentType(fieldProps.calculatedInputType.inputType);

    // create component - ideally with metadata if provided (ATM can specify alternate wrapper)
    // New 2024-06-11 will not break if metadata not specified
    const fieldMetadata: FieldMetadataModel = Reflect.getMetadata(FieldMetadataKey, componentType);

    // generate wrappers if they are defined
    if (fieldMetadata?.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldMetadata.wrappers, fieldConfig);

    // generate the real input field component
    this.log.a('createComponent - add component', [componentType]);
    this.generateAndAttachField(componentType, wrapperInfo.contentsRef, fieldConfig, wrapperInfo.injectors, false);

    // generate the picker preview component if it exists
    const pickerPreviewContainerRef = (wrapperInfo.wrapperRef?.instance as PickerExpandableWrapperComponent)?.previewComponent;
    if (pickerPreviewContainerRef != null) {
      const previewType = this.readComponentType(fieldProps.calculatedInputType.inputType);
      this.log.a('createComponent - add preview', [previewType]);
      this.generateAndAttachField(previewType, pickerPreviewContainerRef, fieldConfig, wrapperInfo.injectors, true);
    }
  }

  private generateAndAttachField(componentType: Type<any>, targetRef: ViewContainerRef, fieldConfig: FieldConfigSet,
    injectors: InjectorBundle, isPreview: boolean) {

    const realFieldRef = targetRef.createComponent(componentType, injectors);
    // used for passing data to controls when fields have multiple controls (e.g. field and a preview)
    const controlConfig: FieldControlConfig = { isPreview };
    Object.assign<Field, Field>(realFieldRef.instance, {
      config: fieldConfig,
      controlConfig,
      group: this.group,
    });

    // return realFieldRef;
  }

  private createWrappers(outerWrapper: DynamicControlInfo, wrappers: string[], fieldConfig: FieldConfigSet): DynamicControlInfo {
    let wrapperInfo = outerWrapper;
    for (const wrapperName of wrappers)
      wrapperInfo = this.createWrapper(wrapperInfo, wrapperName, fieldConfig);
    return wrapperInfo;
  }

  private createWrapper(wrapperInfo: DynamicControlInfo, wrapperName: string, fieldConfig: FieldConfigSet): DynamicControlInfo {
    const componentType = this.readComponentType(wrapperName);
    const ref = wrapperInfo.contentsRef.createComponent(componentType, wrapperInfo.injectors);

    Object.assign<FieldWrapper, Partial<FieldWrapper>>(ref.instance, {
      config: fieldConfig,
      group: this.group,
    });
    // Sub-wrappers should not include the injectors any more
    return new DynamicControlInfo(ref, ref.instance.fieldComponent);
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
