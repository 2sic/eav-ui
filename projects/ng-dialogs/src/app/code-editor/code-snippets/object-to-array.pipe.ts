import { Pipe, PipeTransform } from '@angular/core';
import { Dictionary } from '../../shared/models/dictionary.model';

@Pipe({ name: 'objectToArray' })
export class ObjectToArrayPipe implements PipeTransform {
  transform(obj: Dictionary | Dictionary[]): Dictionary[] {

    if (Array.isArray(obj)) { return obj; }

    return Object.values(obj);
  }
}
