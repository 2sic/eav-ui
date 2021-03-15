import { Pipe, PipeTransform } from '@angular/core';
import { ObjectModel } from '../../shared/models/object.model';

@Pipe({ name: 'objectToArray' })
export class ObjectToArrayPipe implements PipeTransform {
  transform(obj: ObjectModel<any> | ObjectModel<any>[]): ObjectModel<any>[] {

    if (Array.isArray(obj)) { return obj; }

    return Object.values(obj);
  }
}
