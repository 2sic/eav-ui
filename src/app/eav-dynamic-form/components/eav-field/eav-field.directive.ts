import {
  ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef,
  Component, Compiler, ComponentFactory, NgModule, ModuleWithComponentFactories,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { Field } from '../../model/field.interface';
import { FieldConfig } from '../../model/field-config.interface';
import { TypeOption } from '../../model/type-option.interface';
import { FieldTypeConfig, TemplateManipulators } from '../../services/field-type-config.service';
import { FieldWrapper } from '../../model/field-wrapper';

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements Field, OnChanges, OnInit {
  @Input()
  config: FieldConfig;

  @Input()
  group: FormGroup;

  //typeOption: TypeOption;

  //component: ComponentRef<Field>;  
  //private componentRef: ComponentRef<{}>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
    private fieldTypeConfig: FieldTypeConfig,
    private compiler: Compiler
  ) { }

  ngOnChanges() {
    // if (this.component) {
    //   this.component.instance.config = this.config;
    //   this.component.instance.group = this.group;
    // }

  }

  ngOnInit() {
    // if (!components[this.config.type]) {
    //   const supportedTypes = Object.keys(components).join(', ');
    //   throw new Error(
    //     `Trying to use an unsupported type (${this.config.type}).
    //     Supported types: ${supportedTypes}`
    //   );
    // }

    this.createFieldComponent();
  }

  private createFieldComponent(): ComponentRef<Field> {
    //todo: for field groups
    // if (this.field.fieldGroup) {
    //   this.field.type = this.field.type || 'formly-group';
    // }

    //const type = this.fieldTypeConfig.getType(this.config.type),
    // wrappers = this.getFieldWrappers(type);
    const wrappers = ['field-parent-wrapper', 'field-wrapper']

    let fieldComponent = this.container; // = this.component;

    wrappers.forEach(wrapperName => {
      let wrapperRef = this.createComponentWrapper(fieldComponent, this.fieldTypeConfig.getWrapper(wrapperName).component);
      fieldComponent = wrapperRef.instance.fieldComponent;
    });

    return this.createComponent(fieldComponent, 'app-string-default');
  }

  private createComponent(fieldComponent: ViewContainerRef, fieldType: string): ComponentRef<any> {
    let factories = Array.from(this.resolver['_factories'].values());
    console.log('factories', factories);
    let factoryComponentType = factories.find((x: any) => x.selector === fieldType)['componentType'];
    const factory = this.resolver.resolveComponentFactory(<Type<any>>factoryComponentType);
    const ref = fieldComponent.createComponent(factory);

    Object.assign(ref.instance, {
      group: this.group,
      config: this.config,
    });

    return ref;
  }

  private createComponentWrapper(fieldComponent: ViewContainerRef, component: any): ComponentRef<any> {
    let componentFactory = this.resolver.resolveComponentFactory(component);
    let ref = <ComponentRef<FieldWrapper>>fieldComponent.createComponent(componentFactory);
    console.log('component config:', this.config)
    Object.assign(ref.instance, {
      group: this.group,
      config: this.config,
    });

    return ref;
  }

  //----------------------------------------------------
  // This maybe we can use for custom types
  //----------------------------------------------------

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

  //--------------------------------------------
}
