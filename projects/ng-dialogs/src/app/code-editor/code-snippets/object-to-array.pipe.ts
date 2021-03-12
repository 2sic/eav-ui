import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectToArray' })
export class ObjectToArrayPipe implements PipeTransform {
  transform(obj: { [key: string]: any } | { [key: string]: any }[]): { [key: string]: any }[] {

    if (Array.isArray(obj)) { return obj; }

    return Object.values(obj);
  }
}
