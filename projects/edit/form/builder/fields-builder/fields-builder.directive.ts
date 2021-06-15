import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { Dictionary } from '../../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { componentMetadataKey } from '../../../shared/constants';
import { ComponentMetadataModel, FieldProps } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { BooleanDefaultComponent } from '../../fields/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from '../../fields/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from '../../fields/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from '../../fields/custom/custom-json-editor/custom-json-editor.component';
import { ExternalWebComponentComponent } from '../../fields/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from '../../fields/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from '../../fields/empty/empty-default/empty-default.component';
import { EntityContentBlockComponent } from '../../fields/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultComponent } from '../../fields/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from '../../fields/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from '../../fields/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from '../../fields/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from '../../fields/number/number-default/number-default.component';
import { StringDefaultComponent } from '../../fields/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from '../../fields/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from '../../fields/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from '../../fields/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from '../../fields/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from '../../fields/string/string-url-path/string-url-path.component';
import { AdamAttachWrapperComponent } from '../../wrappers/adam-attach-wrapper/adam-attach-wrapper.component';
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

@Directive({ selector: '[appFieldsBuilder]' })
export class FieldsBuilderDirective implements OnInit, OnDestroy {
  @Input() private group: FormGroup;
  private fieldConfigs: FieldConfigSet[] = [];

  private components: Dictionary<Type<any>> = {
    'app-adam-attach-wrapper': AdamAttachWrapperComponent,
    'app-collapsible-wrapper': CollapsibleWrapperComponent,
    'app-dropzone-wrapper': DropzoneWrapperComponent,
    'app-localization-wrapper': LocalizationWrapperComponent,
    'app-entity-expandable-wrapper': EntityExpandableWrapperComponent,
    'app-expandable-wrapper': ExpandableWrapperComponent,
    'app-hidden-wrapper': HiddenWrapperComponent,
    'app-hyperlink-default-expandable-wrapper': HyperlinkDefaultExpandableWrapperComponent,
    'app-hyperlink-library-expandable-wrapper': HyperlinkLibraryExpandableWrapperComponent,
    'boolean-default': BooleanDefaultComponent,
    'boolean-tristate': BooleanTristateComponent,
    'custom-default': CustomDefaultComponent,
    'custom-json-editor': CustomJsonEditorComponent,
    'datetime-default': DatetimeDefaultComponent,
    'empty-default': EmptyDefaultComponent,
    'entity-content-blocks': EntityContentBlockComponent,
    'entity-default': EntityDefaultComponent,
    'entity-query': EntityQueryComponent,
    'external-web-component': ExternalWebComponentComponent,
    'hyperlink-default': HyperlinkDefaultComponent,
    'hyperlink-library': HyperlinkLibraryComponent,
    'number-default': NumberDefaultComponent,
    'string-default': StringDefaultComponent,
    'string-dropdown': StringDropdownComponent,
    'string-dropdown-query': StringDropdownQueryComponent,
    'string-font-icon-picker': StringFontIconPickerComponent,
    'string-template-picker': StringTemplatePickerComponent,
    'string-url-path': StringUrlPathComponent,
  };

  constructor(
    private resolver: ComponentFactoryResolver,
    private containerRef: ViewContainerRef,
    private fieldsSettingsService: FieldsSettingsService,
  ) { }

  ngOnInit() {
    // clear container
    this.containerRef.clear();

    let containerRef = this.containerRef;
    const fieldsProps = this.fieldsSettingsService.getFieldsProps();
    for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
      const fieldConfig: FieldConfigSet = {
        ...fieldProps.constants,
        name: fieldName,
        focused$: new BehaviorSubject(false),
      };
      this.fieldConfigs.push(fieldConfig);

      if (fieldProps.calculatedInputType.inputType === InputTypeConstants.EmptyDefault) {
        containerRef = this.containerRef;
        containerRef = this.createGroup(containerRef, fieldProps, fieldConfig);
      } else if (fieldProps.calculatedInputType.inputType === InputTypeConstants.EmptyEnd) {
        containerRef = this.containerRef;
      } else {
        this.createComponent(containerRef, fieldProps, fieldConfig);
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

    // create component only if componentMetadata exist
    const componentMetadata: ComponentMetadataModel = Reflect.getMetadata(componentMetadataKey, componentType);
    if (componentMetadata == null) { return; }

    if (componentMetadata.wrappers) {
      containerRef = this.createWrappers(containerRef, componentMetadata.wrappers, fieldConfig);
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
