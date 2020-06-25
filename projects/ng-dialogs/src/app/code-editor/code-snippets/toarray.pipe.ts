import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectToArray' })
export class ObjectToArrayPipe implements PipeTransform {
  transform(obj: object | Array<any>): Array<any> {
    if (typeof obj !== typeof {}) { return obj as Array<any>; }
    return Object.keys(obj).map(key => {
      return (obj as any)[key];
    });
  }
}
