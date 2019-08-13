import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';

import { FieldConfigSet, FieldConfigGroup } from '../../model/field-config';
import { FieldWrapper } from '../../model/field-wrapper';
import { ScriptModel, ScriptLoaderService } from '../../../shared/services/script.service';
import { InputTypesConstants } from '../../../shared/constants';
import { FileTypeConstants } from '../../../shared/constants/type-constants';
import { InputTypeService } from '../../../shared/services/input-type.service';
import { InputType } from '../../../shared/models/eav';

@Directive({
  selector: '[appEavField]'
})
export class EavFieldDirective implements OnInit {
  @Input() config: FieldConfigSet[];
  @Input() group: FormGroup;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
    private scriptLoaderService: ScriptLoaderService,
    private inputTypeService: InputTypeService,
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
      if (fieldConfig.field.isExternal) {
        console.log('create external');
        this.createExternalWebComponent(container, fieldConfig);
      } else {
        console.log('create non external', fieldConfig.field.inputType);
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
    console.log('createExternalWebComponent fieldConfig:', fieldConfig);
    const ref: any = this.createComponent(container, fieldConfig);

    // Start loading all external dependencies (start with css). This method recursively load all dependencies.
    const inputType$ = this.inputTypeService.getContentTypeById(fieldConfig.field.inputType);
    let inputType: InputType = null;
    inputType$.pipe(take(1)).subscribe(type => { inputType = type; });
    console.log('createExternalWebComponent inputType:', inputType);
    const allFiles = inputType.AngularAssets.split('\n');
    const cssFiles = [];
    const jsFiles = [];
    allFiles.forEach(file => {
      file = this.scriptLoaderService.resolveSpecialPaths(file);
      console.log('Fetching script from:', file);
      if (file.endsWith('.css')) {
        cssFiles.push(file);
      } else if (file.endsWith('js')) {
        jsFiles.push(file);
      }
    });
    const firstFileType = (cssFiles.length > 0) ? FileTypeConstants.css : FileTypeConstants.javaScript;
    console.log('createExternalWebComponent css:', cssFiles, 'js:', jsFiles, 'firstFileType', firstFileType);
    this.loadWebComponentScripts(
      0,
      fieldConfig.field.name,
      fieldConfig.field.name,
      cssFiles,
      jsFiles,
      firstFileType,
      ref.instance.renderWebComponent,
    );
  }

  private loadWebComponentScripts(
    increment: number,
    name: string,
    type: string,
    styles: string[],
    scripts: string[],
    fileType: string,
    renderWebComponentCallback: any,
  ) {
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
