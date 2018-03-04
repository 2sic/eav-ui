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
export class EavFieldDirective implements OnChanges, OnInit {
  @Input()
  config: FieldConfig[];

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
    console.log('izmjena');
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
    // let fieldComponent = this.container;
    //if field group then create wrapper with child controls

    console.log('this.config1:', this.config);
    this.config.forEach(controlConfiguration => {
      this.createFieldOrGroup(this.container, controlConfiguration, this.group);
    });
  }

  /**
   * create all child fields and groups from fieldConfig in container
   * @param container
   * @param fieldConfig
   * @param group
   */
  private createFieldOrGroup(container: ViewContainerRef, fieldConfig: FieldConfig, group: FormGroup) {
    if (fieldConfig.fieldGroup) {
      //this.createGroupComponents(container, fieldConfig, <FormGroup>group.controls[fieldConfig.name]);
      this.createGroupComponents(container, fieldConfig, group);
    } else {
      this.createFieldComponent(container, fieldConfig, group);
    }
  }

  /**
   * Create field components with wrappers in container
   * @param container 
   * @param fieldConfig 
   * @param group 
   */
  private createFieldComponent(container: ViewContainerRef, fieldConfig: FieldConfig, group: FormGroup) {
    // const ovajTip = 'app-string-default';
    //TODO: read wrapers from input controls
    //const wrappers = ['field-parent-wrapper', 'field-wrapper']
    const wrappers = []

    wrappers.forEach(wrapperName => {
      let wrapperRef = this.createComponentWrapper(container, wrapperName, fieldConfig, group);
      container = wrapperRef.instance.fieldComponent;
    });

    this.createComponent(container, fieldConfig, group);
  }

  /**
   * Create wrapper for form group and all child formControls and fomrGroups in container
   * @param container
   * @param fieldConfig
   * @param group
   */
  private createGroupComponents(container: ViewContainerRef, fieldConfig: FieldConfig, group: FormGroup) {
    const ovajTip = 'empty-default';
    // const wrappers = ['collapsible'];
    const wrappers = ['field-group-wrapper'];

    wrappers.forEach(wrapperName => {
      let wrapperRef = this.createComponentWrapper(container, wrapperName, fieldConfig, group);
      container = wrapperRef.instance.fieldComponent;
    });

    fieldConfig.fieldGroup.forEach(controlConfiguration => {
      this.createFieldOrGroup(container, controlConfiguration, group);
    })
  }

  /**
   * Create component from selector (fieldType) if exist in module. 
   * @param container  place where component is created
   * @param fieldType  
   * @param fieldConfig  is sent to @input config in created component
   * @param group is sent to @input group in created component
   */
  private createComponent(container: ViewContainerRef, fieldConfig: FieldConfig, group: FormGroup): ComponentRef<any> {
    console.log('createComponent', fieldConfig.type);
    let factories = Array.from(this.resolver['_factories'].values());
    console.log('factories', factories);
    let factoryComponentType = factories.find((x: any) => x.selector === fieldConfig.type)['componentType'];
    console.log('uspio');
    const factory = this.resolver.resolveComponentFactory(<Type<any>>factoryComponentType);
    const ref = container.createComponent(factory);

    Object.assign(ref.instance, {
      group: group,
      config: fieldConfig,
    });

    return ref;
  }

  /**
   * Create Wrapper from wrapperName in contaner
   * @param container 
   * @param wrapperName 
   * @param fieldConfig 
   * @param group 
   */
  private createComponentWrapper(container: ViewContainerRef, wrapperName: string, fieldConfig: FieldConfig, group: FormGroup):
    ComponentRef<any> {
    console.log('createComponentWrapper', fieldConfig.name);
    let componentFactory = this.resolver.resolveComponentFactory(this.fieldTypeConfig.getWrapper(wrapperName).component);
    let ref = <ComponentRef<FieldWrapper>>container.createComponent(componentFactory);
    Object.assign(ref.instance, {
      group: group,
      config: fieldConfig
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
