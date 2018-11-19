
// import 'zone.js';
import 'reflect-metadata';

export function InputType(annotation: any) {
    return function (target: Function) {
        // Object.defineProperty(target.prototype, 'wrapper', { value: () => annotation.wrapper });
        // const metadata = new Component(annotation);
        Reflect.defineMetadata('inputTypeAnnotations', annotation, target);
    };
}
