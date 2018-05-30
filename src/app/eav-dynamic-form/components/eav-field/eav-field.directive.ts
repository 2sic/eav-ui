import {
  ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Type, ViewContainerRef,
  Component, NgModule, ModuleWithComponentFactories, ComponentFactory,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { Field } from '../../model/field';
import { FieldConfig } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';
import { CustomInputType } from '../../../shared/models';
import { ScriptModel, ScriptLoaderService } from '../../../shared/services/script.service';
import { InputTypesConstants } from '../../../shared/constants';

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements OnInit {
  @Input()
  config: FieldConfig[];

  @Input()
  group: FormGroup;

  window: any = window;

  addOnList = [];
  externalCommponentRefList = [];

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
    private scriptLoaderService: ScriptLoaderService
  ) { }

  ngOnInit() {
    // Clear lists and container
    this.addOnList = [];
    this.externalCommponentRefList = [];
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
  private createFieldOrGroup(container: ViewContainerRef, fieldConfig: FieldConfig) {
    if (fieldConfig.fieldGroup) {
      // this.createGroupComponents(container, fieldConfig, <FormGroup>group.controls[fieldConfig.name]);
      this.createGroupComponents(container, fieldConfig);
    } else {

      if (fieldConfig.type === InputTypesConstants.external) {
        console.log('create external');
        this.createExternalComponent(container, fieldConfig);
      } else {
        console.log('create non external', fieldConfig.type);
        // this.createFieldComponent(container, fieldConfig, group);
        this.createComponent(container, fieldConfig);
      }
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
  private createComponent(container: ViewContainerRef, fieldConfig: FieldConfig): ComponentRef<any> {
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

      return ref;
    }

    return null;
  }

  /**
   * Register external commponent
   * @param container
   * @param fieldConfig
   */
  private createExternalComponent(container: ViewContainerRef, fieldConfig: FieldConfig) {

    // first create component container - then load script
    const externalComponentRef = this.createComponent(container, fieldConfig);

    console.log('loaded fieldConfig.name', fieldConfig.type);
    // TODO: read data from config
    if (fieldConfig.name === 'customStaticName') {
      // TODO: read data from config
      this.externalCommponentRefList['colour-picker'] = externalComponentRef;
    } else {
      // this.externalCommponentRefList['colour-picker2'] = externalComponentRef;
      console.log('container for script', fieldConfig.name);
      this.externalCommponentRefList[fieldConfig.name] = externalComponentRef;
    }

    if (this.window.addOn === undefined) {
      this.window.addOn = [];
      this.window.addOn = new CustomInputType(this.registerExternalComponent.bind(this));
    }

    // TODO: read data from config
    if (fieldConfig.name === 'customStaticName') {
      this.loadExternalnputTypeScript('colour-picker', '', 'assets/script/colour-picker.js');
    } else {
      // this.loadExternalnputTypeScript('colour-picker2', 'assets/script/colour-picker2.js');

      this.loadExternalnputTypeScript(fieldConfig.name, 'tinymce-wysiwyg', 'assets/script/tinymce-wysiwyg/tinymce-wysiwyg.js');
    }
  }

  private loadExternalnputTypeScript(name: string, type: string, src: string) {
    const script: ScriptModel = {
      name: name,
      src: src,
      loaded: false
    };

    this.scriptLoaderService.load(script).subscribe(s => {
      console.log(' ScriptModel: ', s);

      if (s.loaded) {
        const externalCommponentRef = this.externalCommponentRefList[s.name];
        console.log('loaded addOnList', this.addOnList);
        const factory = this.addOnList[type];
        console.log('loaded name', s.name);
        console.log('loaded this.externalCommponentRefList[name]', this.externalCommponentRefList);
        console.log('loaded factory', factory);
        if (externalCommponentRef && factory) {
          Object.assign(externalCommponentRef.instance, {
            // group: externalCommponentRef.instance.group,
            // config: externalCommponentRef.instance.config,
            factory: Object.create(factory)
          });
        }
      }
    });
  }

  private registerExternalComponent(factory) {
    this.addOnList[factory.name] = factory;

    // sent factory to componentReference  - or on script loaded ??? need to decide!!!

    // this.customInputTypeFactory.initialize(this.customInputTypeHost);
    // this.customInputTypeFactory.render(this.elReference.nativeElement);
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

  // --------------------------------------------
  // another solution
  // https://blog.angularindepth.com/here-is-what-you-need-to-know-about-dynamic-components-in-angular-ac1e96167f9e
  // --------------------------------------------
  // @ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;

  // constructor(private _compiler: Compiler,
  //             private _injector: Injector,
  //             private _m: NgModuleRef<any>) {
  // }

  // ngAfterViewInit() {
  //   const template = '<span>generated on the fly: {{name}}</span>';

  //   const tmpCmp = Component(
  //     {template: template})(
  //       class {
  //   });

  //   const tmpModule = NgModule(
  //     {declarations: [tmpCmp]})(
  //       class {
  //   });

  //   this._compiler.compileModuleAndAllComponentsAsync(tmpModule)
  //     .then((factories) => {
  //       const f = factories.componentFactories[0];
  //       const cmpRef = this.vc.createComponent(tmpCmp);
  //       cmpRef.instance.name = 'dynamic';
  //     })
  // }

  // --------------------------------------------
}
