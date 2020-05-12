import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
    transform(items: any[], field: string, value: string | boolean, isEqual: boolean = true): any[] {
        if (!items) { return []; }
        if (isEqual) {
            return items.filter(it => it[field] === value);
        } else {
            return items.filter(it => it[field] !== value);
        }
    }
}
