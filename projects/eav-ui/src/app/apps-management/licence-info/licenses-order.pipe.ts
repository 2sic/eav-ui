import { Pipe, PipeTransform } from '@angular/core';
import { License } from '../models/license.model';

@Pipe({ name: 'licensesOrder' })
export class LicensesOrderPipe implements PipeTransform {

  transform(licenses: License[]): any {
    if (!Array.isArray(licenses)) { return licenses; }

    const sorted = [...licenses].sort((a: License, b: License) => {
      if (a.Priority < b.Priority) {
        return -1;
      } else if (a.Priority > b.Priority) {
        return 1;
      } else {
        return 0;
      }
    });
    return sorted;
  }
}
