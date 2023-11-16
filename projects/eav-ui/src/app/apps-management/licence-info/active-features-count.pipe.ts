import { Pipe, PipeTransform } from '@angular/core';
import { License } from '../models/license.model';

@Pipe({ name: 'activeFeaturesCount' })
export class ActiveFeaturesCountPipe implements PipeTransform {

  transform(license: License) {
    return `${license.Features.filter(f => f.IsEnabled).length}/${license.Features.length}`;
  }
}
