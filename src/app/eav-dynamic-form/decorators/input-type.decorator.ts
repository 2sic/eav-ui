
import 'zone.js';
import 'reflect-metadata';
import { Component } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/compiler/src/core';


export function CustomComponent(annotation: any) {
    return function (target: Function) {

        var metadata = new Component(annotation);

        Reflect.defineMetadata('annotations', [metadata], target);
    };
};

// export const defaultComponentProps = {
//     selector: undefined,
//     inputs: undefined,
//     outputs: undefined,
//     host: undefined,
//     exportAs: undefined,
//     moduleId: undefined,
//     providers: undefined,
//     viewProviders: undefined,
//     changeDetection: ChangeDetectionStrategy.Default,
//     queries: undefined,
//     templateUrl: undefined,
//     template: undefined,
//     styleUrls: undefined,
//     styles: undefined,
//     animations: undefined,
//     encapsulation: undefined,
//     interpolation: undefined,
//     entryComponents: undefined
// };

// const c = class c { };
// Component({})(c);
// const DecoratorFactory = Object.getPrototypeOf(Reflect.getOwnMetadata('annotations', c)[0]);

// export function CustomComponentDecorator(_props) {
//     console.log(_props);
//     let props = Object.create(DecoratorFactory);
//     props = Object.assign(props, defaultComponentProps, _props);

//     return function (cls) {
//         Reflect.defineMetadata('annotations', [props], cls);
//     }
// }
