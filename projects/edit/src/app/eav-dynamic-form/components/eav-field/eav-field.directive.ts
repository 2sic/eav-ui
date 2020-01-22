import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldConfigSet, FieldConfigGroup } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';
import { InputTypesConstants } from '../../../shared/constants';

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements OnInit {
  @Input() config: FieldConfigSet[];
  @Input() group: FormGroup;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
  ) { }

  ngOnInit() {
    // Clear container
    this.container.clear();

    this.config.forEach(controlConfiguration => {
      console.log('create controlConfiguration', controlConfiguration);
      this.createFieldOrGroup(this.container, controlConfiguration);
    });
  }

  /**
   * create all child fields and groups from fieldConfig in container
   * @param container
   * @param fieldConfig
   */
  private createFieldOrGroup(container: ViewContainerRef, fieldConfig: FieldConfigSet) {
    const field = fieldConfig.field as FieldConfigGroup;
    if (field.fieldGroup) {
      this.createGroupComponents(container, fieldConfig);
    } else {
      console.log('create createFieldOrGroup:', fieldConfig.field.inputType);
      this.createComponent(container, fieldConfig);
    }
  }

  /**
   * Create group components with group wrappers in container
   * @param container
   * @param fieldConfig
   */
  private createGroupComponents(container: ViewContainerRef, fieldConfig: FieldConfigSet) {
    if (fieldConfig.field.wrappers) {
      container = this.createComponentWrappers(container, fieldConfig, fieldConfig.field.wrappers);
    }
    const field = fieldConfig.field as FieldConfigGroup;
    field.fieldGroup.forEach(controlConfiguration => {
      this.createFieldOrGroup(container, controlConfiguration);
    });
  }

  /**
   * Create component and component wrappers if component exist
   * @param container
   * @param fieldConfig
   */
  private createComponent(container: ViewContainerRef, fieldConfig: FieldConfigSet, callback?: Function): ComponentRef<any> {
    if (fieldConfig.field.wrappers) {
      container = this.createComponentWrappers(container, fieldConfig, fieldConfig.field.wrappers);
    }
    console.log('EavFieldDirective createComponent inputType:', fieldConfig.field.inputType);
    let componentType: Type<any>;
    if (fieldConfig.field.isExternal) {
      componentType = this.readComponentType(InputTypesConstants.externalWebComponent);
    } else {
      componentType = this.readComponentType(fieldConfig.field.inputType);
    }

    const inputTypeAnnotations = Reflect.getMetadata('inputTypeAnnotations', componentType);
    // console.log('reading wrapper:', inputTypeAnnotations);

    // if inputTypeAnnotations of componentType exist then create component
    if (inputTypeAnnotations) {
      if (inputTypeAnnotations.wrapper) {
        container = this.createComponentWrappers(container, fieldConfig, inputTypeAnnotations.wrapper);
      }

      const factory = this.resolver.resolveComponentFactory(<Type<any>>componentType);
      const ref = container.createComponent(factory);

      Object.assign(ref.instance, {
        group: this.group,
        config: fieldConfig
      });

      return ref;
    }

    return null;
  }

  /**
   * Read component type by selector with ComponentFactoryResolver
   * @param selector
   */
  private readComponentType(selector: string): Type<any> {
    const factories = Array.from(this.resolver['_factories'].values());
    const componentType = factories.find((x: any) => x.selector === selector)['componentType'];

    return componentType;
  }

  /**
   * Create wrappers in container
   * @param container
   * @param fieldConfig
   * @param wrappers
   */
  private createComponentWrappers(container: ViewContainerRef, fieldConfig: FieldConfigSet, wrappers: string[]): ViewContainerRef {

    wrappers.forEach(wrapperName => {
      container = this.createWrapper(container, fieldConfig, wrapperName);
    });

    return container;
  }

  /**
   * Create wrapper in container
   * @param container
   * @param fieldConfig
   * @param wrapper
   */
  private createWrapper(container: ViewContainerRef, fieldConfig: FieldConfigSet, wrapper: string): ViewContainerRef {
    const componentType = this.readComponentType(wrapper);

    // create component from component type
    const componentFactory = this.resolver.resolveComponentFactory(componentType);
    const ref = <ComponentRef<FieldWrapper>>container.createComponent(componentFactory);

    Object.assign(ref.instance, {
      group: this.group, // this only need if we have form groups
      config: fieldConfig
    });

    return ref.instance.fieldComponent;
  }
}
