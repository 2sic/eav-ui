import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
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
import { ComponentMetadataModel } from '../../../shared/models';
import { FieldConfigGroup, FieldConfigSet } from '../../model/field-config';
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

  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) { }

  ngOnInit() {
    // Clear container
    this.container.clear();

    this.fieldConfigs.forEach(fieldConfig => {
      angularConsoleLog('create controlConfiguration', fieldConfig);
      this.createFieldOrGroup(this.container, fieldConfig);
    });
  }

  /** Create all child fields and groups from fieldConfig in container */
  private createFieldOrGroup(container: ViewContainerRef, fieldConfig: FieldConfigSet) {
    const field = fieldConfig.field as FieldConfigGroup;
    if (field.fieldGroup) {
      this.createGroupComponents(container, fieldConfig);
    } else {
      angularConsoleLog('create createFieldOrGroup:', fieldConfig.field.inputType);
      this.createComponent(container, fieldConfig);
    }
  }

  /** Create group components with group wrappers in container */
  private createGroupComponents(container: ViewContainerRef, fieldConfig: FieldConfigSet) {
    if (fieldConfig.field.wrappers) {
      container = this.createComponentWrappers(container, fieldConfig, fieldConfig.field.wrappers);
    }
    const field = fieldConfig.field as FieldConfigGroup;
    field.fieldGroup.forEach(controlConfiguration => {
      this.createFieldOrGroup(container, controlConfiguration);
    });
  }

  /** Create component and component wrappers if component exist */
  private createComponent(container: ViewContainerRef, fieldConfig: FieldConfigSet): ComponentRef<any> {
    if (fieldConfig.field.wrappers) {
      container = this.createComponentWrappers(container, fieldConfig, fieldConfig.field.wrappers);
    }
    angularConsoleLog('EavFieldDirective createComponent inputType:', fieldConfig.field.inputType);
    let componentType: Type<any>;
    if (fieldConfig.field.isExternal) {
      componentType = this.readComponentType(InputTypeConstants.ExternalWebComponent);
    } else {
      componentType = this.readComponentType(fieldConfig.field.inputType);
    }

    // create component only if componentMetadata exist
    const componentMetadata: ComponentMetadataModel = Reflect.getMetadata(componentMetadataKey, componentType);
    if (componentMetadata == null) { return; }

    if (componentMetadata.wrappers) {
      container = this.createComponentWrappers(container, fieldConfig, componentMetadata.wrappers);
    }

    const factory = this.resolver.resolveComponentFactory(componentType);
    const ref = container.createComponent(factory);

    Object.assign(ref.instance, {
      group: this.group,
      config: fieldConfig
    });

    return ref;
  }

  /** Read component type by selector with ComponentFactoryResolver */
  private readComponentType(selector: string): Type<any> {
    const componentType = this.components[selector];
    if (componentType === undefined) {
      console.error(`Missing component class for: ${selector}`);
      return CustomDefaultComponent;
    }
    return componentType;
  }

  /** Create wrappers in container */
  private createComponentWrappers(container: ViewContainerRef, fieldConfig: FieldConfigSet, wrappers: string[]): ViewContainerRef {
    wrappers.forEach(wrapperName => {
      container = this.createWrapper(container, fieldConfig, wrapperName);
    });
    return container;
  }

  /** Create wrapper in container */
  private createWrapper(container: ViewContainerRef, fieldConfig: FieldConfigSet, wrapper: string): ViewContainerRef {
    const componentType = this.readComponentType(wrapper);

    // create component from component type
    const componentFactory = this.resolver.resolveComponentFactory(componentType);
    const ref: ComponentRef<FieldWrapper> = container.createComponent(componentFactory);

    Object.assign(ref.instance, {
      group: this.group, // this only need if we have form groups
      config: fieldConfig
    });

    return ref.instance.fieldComponent;
  }
}
