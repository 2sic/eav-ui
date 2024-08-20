import { PickerItem } from './picker-item.model';

export interface PickerTreeItem extends PickerItem {
  level: number;
  expandable: boolean;
  // TODO: @SDV - CHECK IF THIS is correct, and if Parent is []
  children: PickerTreeItem[];
  parent: PickerTreeItem[];
}
