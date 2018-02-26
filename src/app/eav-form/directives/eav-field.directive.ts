import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

// import { FormButtonComponent } from '../form-button/form-button.component';
// import { FormInputComponent } from '../form-input/form-input.component';
// import { FormSelectComponent } from '../form-select/form-select.component';

import { Field } from '../model/field.interface';
import { FieldConfig } from '../model/field-config.interface';
import { FieldTypeConfig, TypeOption, TemplateManipulators } from '../services/field-type-config.service';

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

  component: ComponentRef<Field>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
    private fieldTypeConfig: FieldTypeConfig
  ) { }

  ngOnChanges() {
    if (this.component) {
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

    this.createFieldComponent();
  }

  private createFieldComponent(): ComponentRef<Field> {
    //todo: for field groups
    // if (this.field.fieldGroup) {
    //   this.field.type = this.field.type || 'formly-group';
    // }
    const type = this.fieldTypeConfig.getType(this.config.type),
      wrappers = this.getFieldWrappers(type);

    let fieldComponent = this.component;
    wrappers.forEach(wrapperName => {
      let wrapperRef = this.createComponent(fieldComponent, this.fieldTypeConfig.getWrapper(wrapperName).component);
      fieldComponent = wrapperRef.instance.fieldComponent;
    });

    return this.createComponent(fieldComponent, type.component);
  }

  private getFieldWrappers(type: TypeOption) {
    const templateManipulators: TemplateManipulators = {
      preWrapper: [],
      postWrapper: [],
    };

    // if (this.config.templateOptions) {
    //   this.mergeTemplateManipulators(templateManipulators, this.config.templateOptions.templateManipulators);
    // }

    this.mergeTemplateManipulators(templateManipulators, this.fieldTypeConfig.templateManipulators);

    let preWrappers = templateManipulators.preWrapper.map(m => m(this.config)).filter(type => type),
      postWrappers = templateManipulators.postWrapper.map(m => m(this.config)).filter(type => type);

    if (!this.config.wrappers) this.config.wrappers = [];
    if (!type.wrappers) type.wrappers = [];

    return [...preWrappers, ...this.config.wrappers, ...postWrappers];
  }

  private mergeTemplateManipulators(source: TemplateManipulators, target: TemplateManipulators) {
    target = target || {};
    if (target.preWrapper) {
      source.preWrapper = source.preWrapper.concat(target.preWrapper);
    }
    if (target.postWrapper) {
      source.postWrapper = source.postWrapper.concat(target.postWrapper);
    }

    return source;
  }

  private createComponent(fieldComponent: ComponentRef<Field>, component: any): ComponentRef<any> {
    let componentFactory = this.resolver.resolveComponentFactory(component);
    let ref = <ComponentRef<Field>>this.container.createComponent(componentFactory);

    Object.assign(ref.instance, {
      group: this.group,
      config: this.config,
    });
    //TODO: maybe I need this
    //this.componentRefs.push(ref);

    return ref;
  }


}
