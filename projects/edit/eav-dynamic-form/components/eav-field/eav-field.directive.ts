import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
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
import { CollapsibleWrapperComponent } from '../../../eav-material-controls/wrappers';
import { CollapsibleFieldWrapperComponent } from '../../../eav-material-controls/wrappers/collapsible-field-wrapper/collapsible-field-wrapper.component';
import { EntityExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { ExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/expandable-wrapper/expandable-wrapper.component';
import { HiddenWrapperComponent } from '../../../eav-material-controls/wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
import { LocalizationWrapperComponent } from '../../../eav-material-controls/wrappers/localization-wrapper/localization-wrapper.component';
import { componentMetadataKey } from '../../../shared/constants/component-metadata.constants';
import { ComponentMetadataModel, FieldProps } from '../../../shared/models';
import { FieldsSettings2NewService } from '../../../shared/services/fields-settings2new.service';
import { Field } from '../../model/field';
import { FieldConfigSet } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';

@Directive({ selector: '[appEavField]' })
export class EavFieldDirective implements OnInit {
  @Input() private fieldConfigs: FieldConfigSet[];
  @Input() private group: FormGroup;

  private components: { [key: string]: Type<any> } = {
    'app-adam-attach-wrapper': AdamAttachWrapperComponent,
    'app-collapsible-field-wrapper': CollapsibleFieldWrapperComponent,
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
    private container: ViewContainerRef,
    private fieldsSettings2NewService: FieldsSettings2NewService,
  ) { }

  ngOnInit() {
    // clear container
    this.container.clear();

    this.fieldsSettings2NewService.getFieldsProps$().pipe(take(1)).subscribe(fieldsProps => {
      let container = this.container;
      for (const [fieldName, fieldProps] of Object.entries(fieldsProps)) {
        const oldConfig = this.findOldConfig(fieldName, this.fieldConfigs);
        Object.assign(oldConfig, fieldProps.constants);
        if (fieldProps.calculatedInputType.inputType === InputTypeConstants.EmptyDefault) {
          container = this.container;
          container = this.createGroup(container, fieldProps, oldConfig);
        } else {
          this.createComponent(container, fieldProps, oldConfig);
        }
      }
    });
  }

  /** Create group components with group wrappers in container */
  private createGroup(container: ViewContainerRef, fieldProps: FieldProps, oldConfig: FieldConfigSet): ViewContainerRef {
    if (fieldProps.wrappers) {
      container = this.createWrappers(container, fieldProps.wrappers, oldConfig);
    }
    return container;
  }

  /** Create component and component wrappers if component exist */
  private createComponent(container: ViewContainerRef, fieldProps: FieldProps, oldConfig: FieldConfigSet): ComponentRef<Field> {
    if (fieldProps.wrappers) {
      container = this.createWrappers(container, fieldProps.wrappers, oldConfig);
    }

    const componentType = fieldProps.calculatedInputType.isExternal
      ? this.readComponentType(InputTypeConstants.ExternalWebComponent)
      : this.readComponentType(fieldProps.calculatedInputType.inputType);

    // create component only if componentMetadata exist
    const componentMetadata: ComponentMetadataModel = Reflect.getMetadata(componentMetadataKey, componentType);
    if (componentMetadata == null) { return; }

    if (componentMetadata.wrappers) {
      container = this.createWrappers(container, componentMetadata.wrappers, oldConfig);
    }

    const factory = this.resolver.resolveComponentFactory<Field>(componentType);
    const ref = container.createComponent(factory);

    Object.assign<Field, Field>(ref.instance, {
      config: oldConfig,
      group: this.group,
    });

    return ref;
  }

  /** Create wrappers in container */
  private createWrappers(container: ViewContainerRef, wrappers: string[], oldConfig: FieldConfigSet): ViewContainerRef {
    for (const wrapper of wrappers) {
      container = this.createWrapper(container, wrapper, oldConfig);
    }
    return container;
  }

  /** Create wrapper in container */
  private createWrapper(container: ViewContainerRef, wrapper: string, oldConfig: FieldConfigSet): ViewContainerRef {
    const componentType = this.readComponentType(wrapper);
    const componentFactory = this.resolver.resolveComponentFactory<FieldWrapper>(componentType);
    const ref = container.createComponent(componentFactory);

    Object.assign<FieldWrapper, Partial<FieldWrapper>>(ref.instance, {
      config: oldConfig,
      group: this.group,
    });

    return ref.instance.fieldComponent;
  }

  /** Read component type by selector with ComponentFactoryResolver */
  private readComponentType(selector: string): Type<any> {
    const componentType = this.components[selector];
    if (componentType == null) {
      console.error(`Missing component class for: ${selector}`);
      return CustomDefaultComponent;
    }
    return componentType;
  }

  private findOldConfig(fieldName: string, fieldConfigs: FieldConfigSet[]): FieldConfigSet {
    for (const config of fieldConfigs) {
      if (config.name === fieldName) {
        return config;
      } else if (config._fieldGroup) {
        const found = this.findOldConfig(fieldName, config._fieldGroup);
        if (!found) { continue; }
        return found;
      }
    }
  }
}
