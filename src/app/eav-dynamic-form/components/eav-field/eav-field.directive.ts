import {
  ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Type, ViewContainerRef,
  Component, NgModule, ModuleWithComponentFactories, ComponentFactory,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { Field } from '../../model/field';
import { FieldConfig } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements OnInit {
  @Input()
  config: FieldConfig[];

  @Input()
  group: FormGroup;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
    // private compiler: Compiler
  ) { }

  ngOnInit() {
    console.log('container oninit', this.container);
    this.container.clear();
    this.config.forEach(controlConfiguration => {
      this.createFieldOrGroup(this.container, controlConfiguration);
    });
  }

  /**
   * create all child fields and groups from fieldConfig in container
   * @param container
   * @param fieldConfig
   */
  private createFieldOrGroup(container: ViewContainerRef, fieldConfig: FieldConfig) {
    if (fieldConfig.fieldGroup) {
      // this.createGroupComponents(container, fieldConfig, <FormGroup>group.controls[fieldConfig.name]);
      this.createGroupComponents(container, fieldConfig);
    } else {
      // this.createFieldComponent(container, fieldConfig, group);
      this.createComponent(container, fieldConfig);
    }
  }

  /**
   * Create group components with group wrappers in container
   * @param container
   * @param fieldConfig
   */
  private createGroupComponents(container: ViewContainerRef, fieldConfig: FieldConfig) {
    if (fieldConfig.wrappers) {
      container = this.createComponentWrappers(container, fieldConfig, fieldConfig.wrappers);
    }
    fieldConfig.fieldGroup.forEach(controlConfiguration => {
      this.createFieldOrGroup(container, controlConfiguration);
    });
  }

  /**
   * Create component and component wrappers if component exist
   * @param container
   * @param fieldConfig
   */
  private createComponent(container: ViewContainerRef, fieldConfig: FieldConfig) {
    const componentType = this.readComponentType(fieldConfig.type);

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
        config: fieldConfig,
      });

      console.log('container', container);
    }
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
  private createComponentWrappers(container: ViewContainerRef, fieldConfig: FieldConfig, wrappers: string[]): ViewContainerRef {

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
  private createWrapper(container: ViewContainerRef, fieldConfig: FieldConfig, wrapper: string): ViewContainerRef {
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

  // ----------------------------------------------------
  // This maybe we can use for custom types
  // ----------------------------------------------------

  // compileTemplate(): ComponentRef<any>  {
  //   let metadata = {
  //     selector: `runtime-component-sample`,
  //     template: `<div>
  //               <h3>Template</h3>
  //               </div>`
  //     //wrappers: ['field-parent-wrapper', 'field-wrapper']
  //   };

  //   let factory = this.createComponentFactorySync(this.compiler, metadata, null);

  //   if (this.componentRef) {
  //     this.componentRef.destroy();
  //     this.componentRef = null;
  //   }
  //   this.componentRef = this.container.createComponent(factory);

  //   return this.componentRef;
  // }

  // private createComponentFactorySync(compiler: Compiler, metadata: Component, componentClass: any): ComponentFactory<any> {
  //   const cmpClass = componentClass || class RuntimeComponent { name: string = 'Ante' };
  //   const decoratedCmp = Component(metadata)(cmpClass);

  //   @NgModule({ imports: [CommonModule], declarations: [decoratedCmp] })
  //   class RuntimeComponentModule { }

  //   let module: ModuleWithComponentFactories<any> = compiler.compileModuleAndAllComponentsSync(RuntimeComponentModule);
  //   return module.componentFactories.find(f => f.componentType === decoratedCmp);
  // }

  // --------------------------------------------
}
