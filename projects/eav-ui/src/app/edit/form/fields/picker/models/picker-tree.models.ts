import { PickerItem } from 'projects/edit-types';

export interface PickerTreeItem extends PickerItem {
  Level: number;
  Expandable: boolean;
  // TODO: @SDV - CHECK IF THIS is correct, and if Parent is []
  Children: PickerTreeItem[];
  Parent: PickerTreeItem[];
}

export interface TreeItem extends PickerItem {
  // [key: string]: any;
}
