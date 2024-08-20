import { Directive, OnDestroy, OnInit, Type, ViewContainerRef, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../content-type-fields/constants/input-type.constants';
import { CustomDefaultComponent } from '../basic/custom-default/custom-default.component';
import { PickerExpandableWrapperComponent } from '../../fields/wrappers/picker-dialog/picker-expandable-wrapper.component';
import { InputComponents } from '../../fields/input-components.constant';
import { InjectorBundle } from './injector-bundle.model';
import { DynamicControlInfo } from './dynamic-control-info.model';
import { FieldInjectorService } from './field-injector.service';
import { EmptyFieldHelpers } from '../basic/empty-field-helpers';
import { transient } from '../../../core';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { ServiceBase } from '../../../shared/services/service-base';
import { FieldConfigSet } from '../field-config-set.model';
import { FieldMetadataKey, FieldMetadataModel } from '../field-metadata.decorator';
import { FieldsSettingsService } from '../../state/fields-settings.service';
import { FieldProps } from '../../state/fields-configs.model';

const logThis = false;
const nameOfThis = 'FieldsBuilderDirective';

/**
 * This directive is responsible for creating the dynamic fields based on the field settings.
 * It will create the fields based on the settings and attach them to the view.
 */
@Directive({
  selector: '[appFieldsBuilder]',
  standalone: true,
})
export class FieldsBuilderDirective extends ServiceBase implements OnInit, OnDestroy {



  /** Service to create custom injectors for each field */
  private fieldInjector = transient(FieldInjectorService);

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
        fieldName: fieldName,
        focused$: new BehaviorSubject(false),
      };
      this.fieldConfigs.push(fieldConfig);
      const inputType = fieldProps.constants.inputCalc.inputType;

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
    const injectors = this.fieldInjector.getInjectors(fieldConfig, fieldProps.constants.inputCalc);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.buildWrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.buildWrappers);
    return wrapperInfo.contentsRef;
  }

  private createComponent(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet) {
    this.log.a('createComponent', { calculatedInputType: fieldProps.constants.inputCalc });

    // Add injector to first wrapper, so that it will be attached to the top level, and then dropped
    const injectors = this.fieldInjector.getInjectors(fieldConfig, fieldProps.constants.inputCalc);
    let wrapperInfo = new DynamicControlInfo(null, containerRef, injectors);
    if (fieldProps.buildWrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldProps.buildWrappers);

    const componentType = fieldProps.constants.inputCalc.isExternal
      ? this.readComponentType(InputTypeConstants.ExternalWebComponent)
      : this.readComponentType(fieldProps.constants.inputCalc.inputType);

    // create component - ideally with metadata if provided (ATM can specify alternate wrapper)
    // New 2024-06-11 will not break if metadata not specified
    const fieldMetadata: FieldMetadataModel = Reflect.getMetadata(FieldMetadataKey, componentType);

    // generate wrappers if they are defined
    if (fieldMetadata?.wrappers)
      wrapperInfo = this.createWrappers(wrapperInfo, fieldMetadata.wrappers);

    // generate the real input field component
    this.log.a('createComponent - add component', { componentType });
    this.generateAndAttachField(componentType, wrapperInfo.contentsRef, wrapperInfo.injectors);

    // generate the picker preview component if it exists
    const pickerPreviewContainerRef = (wrapperInfo.wrapperRef?.instance as PickerExpandableWrapperComponent)?.previewComponent;
    if (pickerPreviewContainerRef != null) {
      const previewType = this.readComponentType(fieldProps.constants.inputCalc.inputType);
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
