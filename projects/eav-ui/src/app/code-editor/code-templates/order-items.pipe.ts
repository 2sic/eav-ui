import { Pipe, PipeTransform } from '@angular/core';
import { TreeItem } from '../models/tree-item.model';

/** Sorts folders before files */
@Pipe({
    name: 'sortItems',
    standalone: true
})
export class SortItemsPipe implements PipeTransform {

  transform(items: TreeItem[]) {
    if (items == null) { return items; }

    items.sort((item1, item2) => {
      if (item1.isFolder < item2.isFolder) {
        return 1;
      } else if (item1.isFolder > item2.isFolder) {
        return -1;
      } else {
        return 0;
      }
    });
    return items;
  }
}
