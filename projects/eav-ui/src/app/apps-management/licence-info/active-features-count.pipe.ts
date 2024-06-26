import { Pipe, PipeTransform } from '@angular/core';
import { License } from '../models/license.model';

@Pipe({
    name: 'activeFeaturesCount',
    standalone: true
})
export class ActiveFeaturesCountPipe implements PipeTransform {

  transform(license: License) {
    return `${license.Features.filter(f => f.isEnabled).length}/${license.Features.length}`;
  }
}
