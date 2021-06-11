import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { Dictionary } from '../../../../ng-dialogs/src/app/shared/models/dictionary.model';
import { AdamAttachWrapperComponent } from '../../../eav-material-controls/adam/adam-attach-wrapper/adam-attach-wrapper.component';
import { DropzoneWrapperComponent } from '../../../eav-material-controls/adam/dropzone-wrapper/dropzone-wrapper.component';
import { BooleanDefaultComponent } from '../../../eav-material-controls/input-types/boolean/boolean-default/boolean-default.component';
import { BooleanTristateComponent } from '../../../eav-material-controls/input-types/boolean/boolean-tristate/boolean-tristate.component';
import { CustomDefaultComponent } from '../../../eav-material-controls/input-types/custom/custom-default/custom-default.component';
import { CustomJsonEditorComponent } from '../../../eav-material-controls/input-types/custom/custom-json-editor/custom-json-editor.component';
import { ExternalWebComponentComponent } from '../../../eav-material-controls/input-types/custom/external-web-component/external-web-component.component';
import { DatetimeDefaultComponent } from '../../../eav-material-controls/input-types/datetime/datetime-default/datetime-default.component';
import { EmptyDefaultComponent } from '../../../eav-material-controls/input-types/empty/empty-default/empty-default.component';
import { EntityContentBlockComponent } from '../../../eav-material-controls/input-types/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityDefaultComponent } from '../../../eav-material-controls/input-types/entity/entity-default/entity-default.component';
import { EntityQueryComponent } from '../../../eav-material-controls/input-types/entity/entity-query/entity-query.component';
import { HyperlinkDefaultComponent } from '../../../eav-material-controls/input-types/hyperlink/hyperlink-default/hyperlink-default.component';
import { HyperlinkLibraryComponent } from '../../../eav-material-controls/input-types/hyperlink/hyperlink-library/hyperlink-library.component';
import { NumberDefaultComponent } from '../../../eav-material-controls/input-types/number/number-default/number-default.component';
import { StringDefaultComponent } from '../../../eav-material-controls/input-types/string/string-default/string-default.component';
import { StringDropdownQueryComponent } from '../../../eav-material-controls/input-types/string/string-dropdown-query/string-dropdown-query.component';
import { StringDropdownComponent } from '../../../eav-material-controls/input-types/string/string-dropdown/string-dropdown.component';
import { StringFontIconPickerComponent } from '../../../eav-material-controls/input-types/string/string-font-icon-picker/string-font-icon-picker.component';
import { StringTemplatePickerComponent } from '../../../eav-material-controls/input-types/string/string-template-picker/string-template-picker.component';
import { StringUrlPathComponent } from '../../../eav-material-controls/input-types/string/string-url-path/string-url-path.component';
import { CollapsibleWrapperComponent } from '../../../eav-material-controls/wrappers/collapsible-wrapper/collapsible-wrapper.component';
import { EntityExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { ExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/expandable-wrapper/expandable-wrapper.component';
import { HiddenWrapperComponent } from '../../../eav-material-controls/wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from '../../../eav-material-controls/wrappers/localization-wrapper/localization-wrapper.component';
import { componentMetadataKey } from '../../../shared/constants';
import { ComponentMetadataModel, FieldProps } from '../../../shared/models';
import { FieldsSettingsService } from '../../../shared/services';
import { Field } from '../../model/field';
import { FieldConfigSet } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';

@Directive({ selector: '[appEavField]' })
export class EavFieldDirective implements OnInit, OnDestroy {
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
