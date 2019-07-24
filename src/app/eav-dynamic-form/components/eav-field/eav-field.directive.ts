import {
  ComponentFactoryResolver,
  ComponentRef,
  ComponentFactory,
  Component,
  Directive,
  Input,
  NgModule,
  ModuleWithComponentFactories,
  OnInit,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';

import { FieldConfigSet, FieldConfigGroup } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';
import { CustomInputType } from '../../../shared/models';
import { ScriptModel, ScriptLoaderService } from '../../../shared/services/script.service';
import { InputTypesConstants } from '../../../shared/constants';
import { FileTypeConstants } from '../../../shared/constants/type-constants';

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements OnInit {
  @Input()
  config: FieldConfigSet[];

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
  private createFieldOrGroup(container: ViewContainerRef, fieldConfig: FieldConfigSet) {
    const field = fieldConfig.field as FieldConfigGroup;
    if (field.fieldGroup) {
      // this.createGroupComponents(container, fieldConfig, <FormGroup>group.controls[fieldConfig.name]);
      this.createGroupComponents(container, fieldConfig);
    } else {
      console.log('create createFieldOrGroup:', fieldConfig.field.inputType);
      if (fieldConfig.field.inputType === InputTypesConstants.external) {
        console.log('create external');
        this.createExternalComponent(container, fieldConfig);
      } else if (fieldConfig.field.isExternal) {
        this.createExternalWebComponent(container, fieldConfig);
      } else {
        console.log('create non external', fieldConfig.field.inputType);
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
   * Create and register external commponent
   * @param container
   * @param fieldConfig
   */
  private createExternalWebComponent(container: ViewContainerRef, fieldConfig: FieldConfigSet) {
    console.log('createExternalWebComponent');
    const ref: any = this.createComponent(container, fieldConfig);
    // ref.instance.renderWebComponent();
    // // TODO: read data from config
    // Start loading all external dependencies (start with css). This method recursively load all dependencies.
    this.loadWebComponentScripts(
      0,
      fieldConfig.field.name,
      fieldConfig.field.name,
      [],
      [
        'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.0.12/tinymce.min.js',
        'elements/field-string-wysiwyg/wysiwyg-tinymce.js',
        'elements/field-custom-gps/gps-picker.js'
      ],
      FileTypeConstants.javaScript,
      ref.instance.renderWebComponent);
  }

  private loadWebComponentScripts(
    increment: number,
    name: string,
    type: string,
    styles: string[],
    scripts: string[],
    fileType: string,
    renderWebComponentCallback: any) {
    // : Observable<boolean> {
    // return new Observable<boolean>((observer: Observer<boolean>) => {
    const scriptModel: ScriptModel = {
      name: `${fileType}${name}${increment}`,
      filePath: (fileType === FileTypeConstants.css) ? styles[increment] : scripts[increment],
      loaded: false
    };
    this.scriptLoaderService.load(scriptModel, fileType).subscribe(s => {
      if (s.loaded) {
        increment++;
        const nextScript = (fileType === FileTypeConstants.css) ? styles[increment] : scripts[increment];
        if (nextScript) {
          this.loadWebComponentScripts(increment, name, type, styles, scripts, fileType, renderWebComponentCallback);
        } else if (fileType === FileTypeConstants.css) {
          this.loadWebComponentScripts(0, name, type, styles, scripts, FileTypeConstants.javaScript, renderWebComponentCallback);
        } else { // when scripts load is finish then call registered factory
          renderWebComponentCallback();
        }
      }
    });
    // });
  }

  /**
   * Create and register external commponent
   * @param container
   * @param fieldConfig
   */
  private createExternalComponent(container: ViewContainerRef, fieldConfig: FieldConfigSet) {
    // first create component container - then load script
    const externalComponentRef = this.createComponent(container, fieldConfig);

    this.externalCommponentRefList[fieldConfig.field.name] = externalComponentRef;

    if (this.window.addOn === undefined) {
      // this.window.addOn = [];
      this.window.addOn = new CustomInputType(this.registerExternalComponent.bind(this));
    }

    // // TODO: read data from config
    // Start loading all external dependencies (start with css). This method recursively load all dependencies.
    this.loadExternalnputType(
      0,
      fieldConfig.field.name,
      'tinymce-wysiwyg',
      ['assets/script/tinymce-wysiwyg/src/tinymce-wysiwyg.css'],
      ['https://cdn.tinymce.com/4.6/tinymce.min.js',
        'assets/script/tinymce-wysiwyg/src/libs/math.uuid.js',
        'assets/script/tinymce-wysiwyg/src/tinymce-wysiwyg.js'],
      FileTypeConstants.css);
  }

  private loadExternalnputType(increment: number, name: string, type: string, styles: string[], scripts: string[], fileType: string) {
    const scriptModel: ScriptModel = {
      name: `${fileType}${name}${increment}`,
      filePath: (fileType === FileTypeConstants.css) ? styles[increment] : scripts[increment],
      loaded: false
    };

    this.scriptLoaderService.load(scriptModel, fileType).subscribe(s => {
      if (s.loaded) {
        increment++;
        const nextScript = (fileType === FileTypeConstants.css) ? styles[increment] : scripts[increment];
        if (nextScript) {
          console.log('nextScript', name);
          this.loadExternalnputType(increment, name, type, styles, scripts, fileType);
        } else if (fileType === FileTypeConstants.css) {
          console.log('nextScript css', name);
          this.loadExternalnputType(0, name, type, styles, scripts, FileTypeConstants.javaScript);
        } else { // when scripts load is finish then call registered factory
          console.log('nextScript facrory', type);
          this.loadExternalFactoryToComponent(name, type);
        }
      }
    });
  }
  /**
   * First read component reference with NAME and external component (factory) with TYPE,
   * and then add external component (factory) to component (input type) reference.
   * @param name
   * @param type
   */
  private loadExternalFactoryToComponent(name: string, type: string) {
    const externalCommponentRef = this.externalCommponentRefList[name];
    const factory = this.addOnList[type];
    console.log('loaded name factory', this.addOnList);
    if (externalCommponentRef && factory) {
      console.log('loaded name', name);
      console.log('loaded this.externalCommponentRefList[name]', this.externalCommponentRefList);
      console.log('loaded factory', factory);
      Object.assign(externalCommponentRef.instance, {
        factory: Object.create(factory)
      });
    }
  }

  /**
   * When external component is registered on load - this method add that component to list
   * @param factory
   */
  private registerExternalComponent(factory) {
    this.addOnList[factory.name] = factory;
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
