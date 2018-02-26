import { Injectable, Inject, InjectionToken } from '@angular/core';
import { ValidationErrors, FormGroup, FormArray } from '@angular/forms';
// import { Field } from './../templates/field';
// import { reverseDeepMerge } from './../utils';
// import { FormlyFieldConfig, FormlyFormOptions } from '../model/field-config.interface';
import { FieldConfig } from '../model/field-config.interface';
//TODO: export this
import { FormInputComponent } from '../components/inputs/form-input/form-input.component';
//TODO: export this
import { FieldWrapperComponent } from '../components/wrappers/field-wrapper/field-wrapper.component';
//TODO: export this
import { FieldParentWrapperComponent } from '../components/wrappers/field-parent-wrapper/field-parent-wrapper.component';
import { TypeOption } from '../model/type-option.interface';

// export const FORMLY_CONFIG_TOKEN = new InjectionToken<FieldTypeConfig>('FORMLY_CONFIG_TOKEN');

@Injectable()
export class FieldTypeConfig {
    types: { [name: string]: TypeOption } = {};
    // validators: { [name: string]: ValidatorOption } = {};
    wrappers: { [name: string]: WrapperOption } = {};
    // messages: { [name: string]: string | ((error: any, field: FormlyFieldConfig) => string); } = {};

    // TODO: export this
    configs: ConfigOption[] = [{
        wrappers: [{
            name: 'field-wrapper',
            component: FieldWrapperComponent,
            types: []
        },
        {
            name: 'field-parent-wrapper',
            component: FieldParentWrapperComponent,
            types: []
        }
        ],
        // types: [{
        //     name: 'input',
        //     component: FormInputComponent,
        //     wrappers: ['field-parent-wrapper', 'field-wrapper'],
        // }
        // ]
    }];
    // extras: {
    //     // fieldTransform?: ((fields: FieldConfig[], model: any, form: FormGroup | FormArray, options: FormlyFormOptions) => 
    //     fieldTransform?: ((fields: FieldConfig[], form: FormGroup | FormArray) => FieldConfig[])[],
    //     //     showError?: (field: Field) => boolean;
    //     // } = {
    //     //         fieldTransform: undefined,
    //     //         showError: function (field: Field) {
    //     //             return field.formControl && field.formControl.invalid && (field.formControl.touched || (field.options.parentForm && field.options.parentForm.submitted) || (field.field.validation && field.field.validation.show));
    //     //         },
    // };

    // constructor(@Inject(FORMLY_CONFIG_TOKEN) configs: ConfigOption[] = []) {
    constructor() {
        this.configs.forEach(config => this.addConfig(config));
    }

    addConfig(config: ConfigOption) {
        // if (config.types) {
        //     config.types.forEach(type => this.setType(type));
        // }
        // if (config.validators) {
        //     config.validators.forEach(validator => this.setValidator(validator));
        // }
        if (config.wrappers) {
            config.wrappers.forEach(wrapper => this.setWrapper(wrapper));
        }
        // if (config.manipulators) {
        //     config.manipulators.forEach(manipulator => this.setManipulator(manipulator));
        // }
        // if (config.validationMessages) {
        //     config.validationMessages.forEach(validation => this.addValidatorMessage(validation.name, validation.message));
        // }
        // if (config.extras) {
        //     this.extras = { ...this.extras, ...config.extras };
        // }
    }

    setType(options: TypeOption | TypeOption[]) {
        if (Array.isArray(options)) {
            options.forEach((option) => this.setType(option));
        } else {
            console.log('configuration options:', options);
            if (!this.types[options.name]) {
                this.types[options.name] = <TypeOption>{};
            }
            this.types[options.name].component = options.component;
            this.types[options.name].name = options.name;
            // this.types[options.name].extends = options.extends;
            // this.types[options.name].defaultOptions = options.defaultOptions;
            if (options.wrappers) {
                options.wrappers.forEach((wrapper) => this.setTypeWrapper(options.name, wrapper));
            }
        }
    }

    getType(name: string): TypeOption {
        if (!this.types[name]) {
            throw new Error(`[Formly Error] There is no type by the name of "${name}"`);
        }

        //this.mergeExtendedType(name);

        return this.types[name];
    }

    setWrapper(options: WrapperOption) {
        this.wrappers[options.name] = options;
        if (options.types) {
            options.types.forEach((type) => {
                this.setTypeWrapper(type, options.name);
            });
        }
    }

    getWrapper(name: string): WrapperOption {
        if (!this.wrappers[name]) {
            throw new Error(`[Formly Error] There is no wrapper by the name of "${name}"`);
        }

        return this.wrappers[name];
    }

    setTypeWrapper(type: string, name: string) {
        if (!this.types[type]) {
            this.types[type] = <TypeOption>{};
        }
        if (!this.types[type].wrappers) {
            this.types[type].wrappers = <[string]>[];
        }
        this.types[type].wrappers.push(name);
    }

    // setValidator(options: ValidatorOption) {
    //     this.validators[options.name] = options;
    // }

    // getValidator(name: string): ValidatorOption {
    //     if (!this.validators[name]) {
    //         throw new Error(`[Formly Error] There is no validator by the name of "${name}"`);
    //     }

    //     return this.validators[name];
    // }

    // addValidatorMessage(name: string, message: string | ((error: any, field: FormlyFieldConfig) => string)) {
    //     this.messages[name] = message;
    // }

    // getValidatorMessage(name: string) {
    //     return this.messages[name];
    // }

    // setManipulator(manipulator: ManipulatorOption) {
    //     new manipulator.class()[manipulator.method](this);
    // }

    // private mergeExtendedType(name: string) {
    //     if (!this.types[name].extends) {
    //         return;
    //     }

    //     const extendedType = this.getType(this.types[name].extends);
    //     if (!this.types[name].component) {
    //         this.types[name].component = extendedType.component;
    //     }

    //     if (!this.types[name].wrappers) {
    //         this.types[name].wrappers = extendedType.wrappers;
    //     }
    // }
}
// export interface TypeOption {
//     name: string;
//     component?: any;
//     wrappers?: string[];
//     // extends?: string;
//     // defaultOptions?: FieldConfig;
// }

export interface WrapperOption {
    name: string;
    component: any;
    types?: string[];
}

// export interface ValidatorOption {
//     name: string;
//     validation: string | ValidationErrors;
// }

// export interface ValidationMessageOption {
//     name: string;
//     message: string | ((error: any, field: FieldConfig) => string);
// }

export interface ManipulatorOption {
    class?: { new(): any };
    method?: string;
}

export interface ManipulatorWrapper {
    (f: FieldConfig): string;
}

export interface TemplateManipulators {
    preWrapper?: ManipulatorWrapper[];
    postWrapper?: ManipulatorWrapper[];
}

export interface ConfigOption {
    //types?: TypeOption[];
    wrappers?: WrapperOption[];
    // validators?: ValidatorOption[];
    // validationMessages?: ValidationMessageOption[];
    // manipulators?: ManipulatorOption[];
    // extras?: {
    //     fieldTransform?: any,
    //     showError?: (field: FieldConfig) => boolean;
    // };
}
