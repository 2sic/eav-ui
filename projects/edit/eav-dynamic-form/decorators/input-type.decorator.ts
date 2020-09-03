import 'reflect-metadata';

export function InputType(annotation: any) {
  return (target: any) => {
    // Object.defineProperty(target.prototype, 'wrapper', { value: () => annotation.wrapper });
    // const metadata = new Component(annotation);
    Reflect.defineMetadata('inputTypeAnnotations', annotation, target);
  };
}
