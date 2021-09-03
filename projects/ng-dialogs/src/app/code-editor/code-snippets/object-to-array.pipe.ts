import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectToArray' })
export class ObjectToArrayPipe implements PipeTransform {
  transform(obj: Record<string, any> | Record<string, any>[]): Record<string, any>[] {
    if (obj == null) { return; }

    if (Array.isArray(obj)) { return obj; }

    return Object.values(obj);
  }
}
