import { Value1 } from './value1';

export class Attribute1<T> {
  [key: string]: Value1<T>;
}
