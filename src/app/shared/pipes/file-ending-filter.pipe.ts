import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileEndingFilter' })
export class FileEndingFilterPipe implements PipeTransform {
    transform(items: any[], allowedFileTypes): any[] {
        if (!items) { return []; }
        if (allowedFileTypes.length === 0) {
            return items;
        }
        return items.filter(it => allowedFileTypes.indexOf(it.Name.match(/(?:\.([^.]+))?$/)[0]) !== -1);
    }
}
