import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfigSet, FieldConfigGroup } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';
import { InputTypesConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-types-constants';

// components
import { AdamAttachWrapperComponent } from '../../../eav-material-controls/adam/adam-attach-wrapper/adam-attach-wrapper.component';
import { CollapsibleFieldWrapperComponent } from '../../../eav-material-controls/wrappers/collapsible-field-wrapper/collapsible-field-wrapper.component';
import { CollapsibleWrapperComponent } from '../../../eav-material-controls/wrappers';
import { DropzoneWrapperComponent } from '../../../eav-material-controls/adam/dropzone-wrapper/dropzone-wrapper.component';
import { EavLocalizationComponent } from '../../../eav-material-controls/wrappers/eav-localization-wrapper/eav-localization-wrapper.component';
import { EntityExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/entity-expandable-wrapper/entity-expandable-wrapper.component';
import { ExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/expandable-wrapper/expandable-wrapper.component';
import { HiddenWrapperComponent } from '../../../eav-material-controls/wrappers/hidden-wrapper/hidden-wrapper.component';
import { HyperlinkDefaultExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/hyperlink-default-expandable-wrapper/hyperlink-default-expandable-wrapper.component';
import { HyperlinkLibraryExpandableWrapperComponent } from '../../../eav-material-controls/wrappers/hyperlink-library-expandable-wrapper/hyperlink-library-expandable-wrapper.component';
// tslint:disable-next-line:max-line-length
import { BooleanDefaultComponent, DatetimeDefaultComponent, EmptyDefaultComponent, EntityDefaultComponent, HyperlinkDefaultComponent, NumberDefaultComponent, StringDefaultComponent, StringDropdownComponent, StringDropdownQueryComponent, StringFontIconPickerComponent, StringTemplatePickerComponent, StringUrlPathComponent } from '../../../eav-material-controls/input-types';
import { CustomDefaultComponent } from '../../../eav-material-controls/input-types/custom/custom-default/custom-default.component';
import { EntityContentBlockComponent } from '../../../eav-material-controls/input-types/entity/entity-content-blocks/entity-content-blocks.component';
import { EntityQueryComponent } from '../../../eav-material-controls/input-types/entity/entity-query/entity-query.component';
import { ExternalWebComponentComponent } from '../../../eav-material-controls/input-types/custom/external-web-component/external-web-component.component';
import { HyperlinkLibraryComponent } from '../../../eav-material-controls/input-types/hyperlink/hyperlink-library/hyperlink-library.component';
import { angularConsoleLog } from '../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';
import { BooleanTristateComponent } from '../../../eav-material-controls/input-types/boolean/boolean-tristate/boolean-tristate.component';

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements OnInit {
  @Input() config: FieldConfigSet[];
  @Input() group: FormGroup;

  private components: { [key: string]: Type<any> } = {
    'app-adam-attach-wrapper': AdamAttachWrapperComponent,
    'app-collapsible-field-wrapper': CollapsibleFieldWrapperComponent,
    'app-collapsible-wrapper': CollapsibleWrapperComponent,
    'app-dropzone-wrapper': DropzoneWrapperComponent,
    'app-eav-localization-wrapper': EavLocalizationComponent,
    'app-entity-expandable-wrapper': EntityExpandableWrapperComponent,
    'app-expandable-wrapper': ExpandableWrapperComponent,
    'app-hidden-wrapper': HiddenWrapperComponent,
    'app-hyperlink-default-expandable-wrapper': HyperlinkDefaultExpandableWrapperComponent,
    'app-hyperlink-library-expandable-wrapper': HyperlinkLibraryExpandableWrapperComponent,
    'boolean-default': BooleanDefaultComponent,
    'boolean-tristate': BooleanTristateComponent,
    'custom-default': CustomDefaultComponent,
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

    this.config.forEach(controlConfiguration => {
      angularConsoleLog('create controlConfiguration', controlConfiguration);
      this.createFieldOrGroup(this.container, controlConfiguration);
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
      componentType = this.readComponentType(InputTypesConstants.externalWebComponent);
    } else {
      componentType = this.readComponentType(fieldConfig.field.inputType);
    }

    // if inputTypeAnnotations of componentType exist then create component
    const inputTypeAnnotations = Reflect.getMetadata('inputTypeAnnotations', componentType);
    if (inputTypeAnnotations) {
      if (inputTypeAnnotations.wrapper) {
        container = this.createComponentWrappers(container, fieldConfig, inputTypeAnnotations.wrapper);
      }

      const factory = this.resolver.resolveComponentFactory(componentType);
      const ref = container.createComponent(factory);

      Object.assign(ref.instance, {
        group: this.group,
        config: fieldConfig
      });

      return ref;
    }

    return null;
  }

  /** Read component type by selector with ComponentFactoryResolver */
  private readComponentType(selector: string): Type<any> {
    // const factories = Array.from((this.resolver as any)._factories.values());
    // const componentType = (factories.find((x: any) => x.selector === selector) as any).componentType;
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
