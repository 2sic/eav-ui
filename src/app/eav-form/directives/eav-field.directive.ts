import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

// import { FormButtonComponent } from '../form-button/form-button.component';
// import { FormInputComponent } from '../form-input/form-input.component';
// import { FormSelectComponent } from '../form-select/form-select.component';

import { Field } from '../model/field.interface';
import { FieldConfig } from '../model/field-config.interface';
import { TypeOption } from '../model/type-option.interface';
import { FieldTypeConfig, TemplateManipulators } from '../services/field-type-config.service';
import { FieldWrapper } from '../model/field-wrapper';

// const components: {[type: string]: Type<Field>} = {
//   button: FormButtonComponent,
//   input: FormInputComponent,
//   select: FormSelectComponent
// };

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements Field, OnChanges, OnInit {
  @Input()
  config: FieldConfig;

  @Input()
  group: FormGroup;

  typeOption: TypeOption;

  component: ComponentRef<Field>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
    private fieldTypeConfig: FieldTypeConfig
  ) { }

  ngOnChanges() {
    if (this.component) {
      console.log('directive on change config:', this.config)
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
    }
  }

  ngOnInit() {
    // if (!components[this.config.type]) {
    //   const supportedTypes = Object.keys(components).join(', ');
    //   throw new Error(
    //     `Trying to use an unsupported type (${this.config.type}).
    //     Supported types: ${supportedTypes}`
    //   );
    // }
    // const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
    // this.component = this.container.createComponent(component);
    // this.component.instance.config = this.config;
    // this.component.instance.group = this.group;
    console.log('on init directive this.config', this.config)

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

    // const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
    // this.component = this.container.createComponent(component);
    let fieldComponent = this.container; // = this.component;

    // let wrapperRef = this.createComponent(this.container, this.fieldTypeConfig.getWrapper('field-parent-wrapper').component);
    // fieldComponent = wrapperRef.instance.fieldComponent;

    //-----------------
    // let componentFactory3 = this.resolver.resolveComponentFactory(this.fieldTypeConfig.getWrapper('field-parent-wrapper').component);
    // let wrapperRef3 = <ComponentRef<FieldWrapper>>fieldComponent.createComponent(componentFactory3);

    // Object.assign(wrapperRef3.instance, {
    //   group: this.group,
    //   config: this.config,
    // });
    // fieldComponent = wrapperRef3.instance.fieldComponent;
    // //-----------------
    // let componentFactory2 = this.resolver.resolveComponentFactory(this.fieldTypeConfig.getWrapper('field-wrapper').component);
    // let wrapperRef2 = <ComponentRef<FieldWrapper>>fieldComponent.createComponent(componentFactory2);

    // Object.assign(wrapperRef2.instance, {
    //   group: this.group,
    //   config: this.config,
    // });
    // fieldComponent = wrapperRef2.instance.fieldComponent;
    //-----------------
    // let componentFactory = this.resolver.resolveComponentFactory(type.component);
    // let ref = <ComponentRef<Field>>fieldComponent.createComponent(componentFactory);
    //-----------------
    // fieldComponent = ref;
    // console.log('container: ', this.container);
    // console.log('fieldComponent: ', fieldComponent);
    wrappers.forEach(wrapperName => {
      let wrapperRef = this.createComponentWrapper(fieldComponent, this.fieldTypeConfig.getWrapper(wrapperName).component);
      fieldComponent = wrapperRef.instance.fieldComponent;
    });

    // return this.createComponent(fieldComponent, type.component);

    return this.createComponent(fieldComponent, 'string-default');
  }

  private getFieldWrappers(type: TypeOption) {
    // const templateManipulators: TemplateManipulators = {
    //   preWrapper: [],
    //   postWrapper: [],
    // };

    // if (this.config.templateOptions) {
    //   this.mergeTemplateManipulators(templateManipulators, this.config.templateOptions.templateManipulators);
    // }

    // this.mergeTemplateManipulators(templateManipulators, this.fieldTypeConfig.templateManipulators);

    // let preWrappers = templateManipulators.preWrapper.map(m => m(this.config)).filter(type => type),
    //   postWrappers = templateManipulators.postWrapper.map(m => m(this.config)).filter(type => type);
    // console.log('directive preWrappers', preWrappers)
    // console.log('directive preWrappers', postWrappers)
    console.log('directive type.wrappers before', type.wrappers)
    //if (!this.config.wrappers) this.config.wrappers = [];
    if (!type.wrappers) type.wrappers = [];
    console.log('directive type.wrappers after', type.wrappers)
    return [...type.wrappers];
    // return [...preWrappers, ...this.config.wrappers, ...postWrappers];
  }

  // private mergeTemplateManipulators(source: TemplateManipulators, target: TemplateManipulators) {
  //   target = target || {};
  //   if (target.preWrapper) {
  //     source.preWrapper = source.preWrapper.concat(target.preWrapper);
  //   }
  //   if (target.postWrapper) {
  //     source.postWrapper = source.postWrapper.concat(target.postWrapper);
  //   }

  //   return source;
  // }

  private createComponent(fieldComponent: ViewContainerRef, fieldType: string): ComponentRef<any> {
    let factories = Array.from(this.resolver['_factories'].values());
    let factoryComponentType = factories.find((x: any) => x.selector === fieldType)['componentType'];
    const factory = this.resolver.resolveComponentFactory(<Type<any>>factoryComponentType);
    const ref = fieldComponent.createComponent(factory);

    Object.assign(ref.instance, {
      group: this.group,
      config: this.config,
    });
    //TODO: maybe I need this
    //this.componentRefs.push(ref);

    return ref;
  }

  private createComponentWrapper(fieldComponent: ViewContainerRef, component: any): ComponentRef<any> {
    let componentFactory = this.resolver.resolveComponentFactory(component);
    let ref = <ComponentRef<FieldWrapper>>fieldComponent.createComponent(componentFactory);

    Object.assign(ref.instance, {
      group: this.group,
      config: this.config,
    });

    return ref;
  }

  // private createComponent(fieldComponent: ViewContainerRef, component: any): ComponentRef<any> {
  //   let componentFactory = this.resolver.resolveComponentFactory(component);
  //   let ref = <ComponentRef<Field>>fieldComponent.createComponent(componentFactory);

  //   Object.assign(ref.instance, {
  //     group: this.group,
  //     config: this.config,
  //   });
  //   //TODO: maybe I need this
  //   //this.componentRefs.push(ref);

  //   return ref;
  // }


}
