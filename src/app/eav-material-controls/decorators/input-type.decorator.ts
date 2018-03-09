
import 'zone.js';
import 'reflect-metadata';
import { Component } from '@angular/core';
// import { ChangeDetectionStrategy } from '@angular/compiler/src/core';

export function InputTypeDecorator(annotation: any) {
    return function (target: Function) {
        Object.defineProperty(target.prototype, 'wrapper', { value: () => annotation.wrapper });
        console.log('annotation: ', annotation);
        const metadata = new Component(annotation);
        // Injector
        Reflect.defineMetadata('annotations', [metadata], target);
    };
}
