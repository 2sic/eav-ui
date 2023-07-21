import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { FieldMetadataKey, WrappersConstants } from '../../../shared/constants';
import { FieldMetadataModel, FieldProps } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { BooleanDefaultComponent } from '../../fields/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from '../../fields/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from '../../fields/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from '../../fields/custom/custom-json-editor/custom-json-editor.component';
import { ExternalWebComponentComponent } from '../../fields/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from '../../fields/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from '../../fields/empty/empty-default/empty-default.component';
import { EmptyMessageComponent } from '../../fields/empty/empty-message/empty-message.component';
import { EntityContentBlockComponent } from '../../fields/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultComponent } from '../../fields/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from '../../fields/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from '../../fields/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from '../../fields/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from '../../fields/number/number-default/number-default.component';
import { NumberDropdownComponent } from '../../fields/number/number-dropdown/number-dropdown.component';
import { StringDefaultComponent } from '../../fields/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from '../../fields/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from '../../fields/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from '../../fields/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from '../../fields/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from '../../fields/string/string-url-path/string-url-path.component';
import { AdamWrapperComponent } from '../../wrappers/adam-wrapper/adam-wrapper.component';
import { CollapsibleWrapperComponent } from '../../wrappers/collapsible-wrapper/collapsible-wrapper.component';
import { DropzoneWrapperComponent } from '../../wrappers/dropzone-wrapper/dropzone-wrapper.component';
import { EntityExpandableWrapperComponent } from '../../wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { ExpandableWrapperComponent } from '../../wrappers/expandable-wrapper/expandable-wrapper.component';
import { HiddenWrapperComponent } from '../../wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from '../../wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from '../../wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from '../../wrappers/localization-wrapper/localization-wrapper.component';
import { FieldConfigSet } from './field-config-set.model';
import { FieldWrapper } from './field-wrapper.model';
import { Field } from './field.model';
import { EmptyFieldHelpers } from '../../fields/empty/empty-field-helpers';

@Directive({ selector: '[appFieldsBuilder]' })
export class FieldsBuilderDirective implements OnInit, OnDestroy {
  @Input() group: UntypedFormGroup;
  private fieldConfigs: FieldConfigSet[] = [];

  private components: Record<string, Type<any>> = {
    [WrappersConstants.AdamWrapper]: AdamWrapperComponent,
    [WrappersConstants.CollapsibleWrapper]: CollapsibleWrapperComponent,
    [WrappersConstants.DropzoneWrapper]: DropzoneWrapperComponent,
    [WrappersConstants.EntityExpandableWrapper]: EntityExpandableWrapperComponent,
    [WrappersConstants.ExpandableWrapper]: ExpandableWrapperComponent,
    [WrappersConstants.HiddenWrapper]: HiddenWrapperComponent,
    [WrappersConstants.HyperlinkDefaultExpandableWrapper]: HyperlinkDefaultExpandableWrapperComponent,
    [WrappersConstants.HyperlinkLibraryExpandableWrapper]: HyperlinkLibraryExpandableWrapperComponent,
    [WrappersConstants.LocalizationWrapper]: LocalizationWrapperComponent,
    [InputTypeConstants.BooleanDefault]: BooleanDefaultComponent,
    [InputTypeConstants.BooleanTristate]: BooleanTristateComponent,
    [InputTypeConstants.CustomDefault]: CustomDefaultComponent,
    [InputTypeConstants.CustomJsonEditor]: CustomJsonEditorComponent,
    [InputTypeConstants.DatetimeDefault]: DatetimeDefaultComponent,
    [InputTypeConstants.EmptyDefault]: EmptyDefaultComponent,
    [InputTypeConstants.EmptyMessage]: EmptyMessageComponent,
    [InputTypeConstants.EntityContentBlocks]: EntityContentBlockComponent,
    [InputTypeConstants.EntityDefault]: EntityDefaultComponent,
    [InputTypeConstants.EntityQuery]: EntityQueryComponent,
    [InputTypeConstants.ExternalWebComponent]: ExternalWebComponentComponent,
    [InputTypeConstants.HyperlinkDefault]: HyperlinkDefaultComponent,
    [InputTypeConstants.HyperlinkLibrary]: HyperlinkLibraryComponent,
    [InputTypeConstants.NumberDefault]: NumberDefaultComponent,
    [InputTypeConstants.NumberDropdown]: NumberDropdownComponent,
    [InputTypeConstants.StringDefault]: StringDefaultComponent,
    [InputTypeConstants.StringDropdown]: StringDropdownComponent,
    [InputTypeConstants.StringDropdownQuery]: StringDropdownQueryComponent,
    [InputTypeConstants.StringFontIconPicker]: StringFontIconPickerComponent,
    [InputTypeConstants.StringJson]: CustomJsonEditorComponent,
    [InputTypeConstants.StringTemplatePicker]: StringTemplatePickerComponent,
    [InputTypeConstants.StringUrlPath]: StringUrlPathComponent,
  };

  constructor(
    private resolver: ComponentFactoryResolver,
    private mainContainerRef: ViewContainerRef,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

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
    for (const fieldConfig of this.fieldConfigs) {
      fieldConfig.focused$.complete();
    }
  }

  private createGroup(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet): ViewContainerRef {
    if (fieldProps.wrappers) {
      containerRef = this.createWrappers(containerRef, fieldProps.wrappers, fieldConfig);
    }
    return containerRef;
  }

  private createComponent(containerRef: ViewContainerRef, fieldProps: FieldProps, fieldConfig: FieldConfigSet): ComponentRef<Field> {
    if (fieldProps.wrappers) {
      containerRef = this.createWrappers(containerRef, fieldProps.wrappers, fieldConfig);
    }

    const componentType = fieldProps.calculatedInputType.isExternal
      ? this.readComponentType(InputTypeConstants.ExternalWebComponent)
      : this.readComponentType(fieldProps.calculatedInputType.inputType);

    // create component only if fieldMetadata exist
    const fieldMetadata: FieldMetadataModel = Reflect.getMetadata(FieldMetadataKey, componentType);
    if (fieldMetadata == null) { return; }

    if (fieldMetadata.wrappers) {
      containerRef = this.createWrappers(containerRef, fieldMetadata.wrappers, fieldConfig);
    }

    const factory = this.resolver.resolveComponentFactory<Field>(componentType);
    const ref = containerRef.createComponent(factory);

    Object.assign<Field, Field>(ref.instance, {
      config: fieldConfig,
      group: this.group,
    });

    return ref;
  }

  private createWrappers(containerRef: ViewContainerRef, wrappers: string[], fieldConfig: FieldConfigSet): ViewContainerRef {
    for (const wrapper of wrappers) {
      containerRef = this.createWrapper(containerRef, wrapper, fieldConfig);
    }
    return containerRef;
  }

  private createWrapper(containerRef: ViewContainerRef, wrapper: string, fieldConfig: FieldConfigSet): ViewContainerRef {
    const componentType = this.readComponentType(wrapper);
    const componentFactory = this.resolver.resolveComponentFactory<FieldWrapper>(componentType);
    const ref = containerRef.createComponent(componentFactory);

    Object.assign<FieldWrapper, Partial<FieldWrapper>>(ref.instance, {
      config: fieldConfig,
      group: this.group,
    });

    return ref.instance.fieldComponent;
  }

  private readComponentType(selector: string): Type<any> {
    const componentType = this.components[selector];
    if (componentType == null) {
      console.error(`Missing component class for: ${selector}`);
      return CustomDefaultComponent;
    }
    return componentType;
  }
}
