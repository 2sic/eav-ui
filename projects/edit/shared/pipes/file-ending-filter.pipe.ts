import { Pipe, PipeTransform } from '@angular/core';

import { AdamItem } from '../models/adam/adam-item';

@Pipe({ name: 'fileEndingFilter' })
export class FileEndingFilterPipe implements PipeTransform {
  transform(items: AdamItem[], allowedFileTypes: string[]) {
    if (!items) { return []; }
    if (allowedFileTypes.length === 0) { return items; }
    return items.filter(item => allowedFileTypes.indexOf(item.Name.match(/(?:\.([^.]+))?$/)[0]) !== -1);
  }
}
