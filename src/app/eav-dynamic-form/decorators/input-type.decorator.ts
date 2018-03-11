
// import 'zone.js';
import 'reflect-metadata';
import { Component } from '@angular/core';
// import { ChangeDetectionStrategy } from '@angular/compiler/src/core';

export function InputTypeDecorator(annotation: any) {
    return function (target: Function) {
        Object.defineProperty(target.prototype, 'wrapper', { value: () => annotation.wrapper });
        const metadata = new Component(annotation);
        Reflect.defineMetadata('annotations', [metadata], target);
    };
}
