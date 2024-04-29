import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { PickerItem, UiPickerModeTree } from 'projects/edit-types';
import { TreeItem, PickerTreeItem } from '../models/picker-tree.models';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';

const logThis = true;

export class PickerTreeDataHelper extends ServiceBase {

  public treeFlattener: MatTreeFlattener<TreeItem, PickerTreeItem>;
  private pickerTreeConfiguration: UiPickerModeTree;
  private optionItems$: BehaviorSubject<PickerItem[]>;

  dataSource: MatTreeFlatDataSource<TreeItem, PickerTreeItem, PickerTreeItem>

  constructor() {
    super(new EavLogger('PickerTreeHelper', logThis));

    this.build();
  }

    /** Needed later for tree implementation testing */
  public static treeControl = new FlatTreeControl<PickerTreeItem>(
    item => item.Level,
    item => item.Expandable,
  );

  public updateConfig(pickerConfig: UiPickerModeTree) {
    this.log.add('updateConfigAndSelectedData');
    // set config, which will be accessed on 'this.' whenever it's needed
    this.pickerTreeConfiguration = pickerConfig;
  }

  public addOptionItems(optionItems$: BehaviorSubject<PickerItem[]>) {
    this.log.add('addOptionItems');
    this.optionItems$ = optionItems$;
  }

  public updateSelectedData(selectedData: PickerItem[]) {
    this.log.add('updateSelectedData');
    this.dataSource.data = selectedData;
  }
  

  public build() {
    this.log.add('build');
    // const optionItems = this.optionItems$.value;

    this.treeFlattener = new MatTreeFlattener(
      (item, Level): PickerTreeItem => {
        const treeConfig = this.pickerTreeConfiguration;
        const cpRef = treeConfig?.TreeChildParentRefField;
        const pcRef = treeConfig?.TreeParentChildRefField;
        const cId = treeConfig?.TreeChildIdField;
        const pId = treeConfig?.TreeParentIdField;
        const cStreamName = treeConfig?.TreeLeavesStream;
        const pStreamName = treeConfig?.TreeBranchesStream;
        const optionItems = this.optionItems$.value;
        const itemInCorrectStream = optionItems.filter(x => !x.sourceStreamName || x.sourceStreamName == pStreamName).find(x => x == item);
        const expandable = (treeConfig?.TreeRelationship == 'parent-child')
            ? itemInCorrectStream && !!item.data[pcRef] && item.data[pcRef].length > 0
            : itemInCorrectStream && !!optionItems.find(x => {
              if (x.data[cpRef] != undefined && x.data[cpRef][0] != undefined && item != undefined)
                return x.data[cpRef][0][pId] == item.data[pId]
            });
        return {
          Level: Level,
          Expandable: expandable,
          value: item.value,
          label: item.label,
          Parent: item.data[cpRef],
          Children: item.data[pcRef],
          tooltip: item.tooltip,
          infoBox: item.infoBox,
          helpLink: item.helpLink,
        };
      },
      (item): number => { return item.Level; },
      (item): boolean => { return item.Expandable; },
      (item): PickerItem[] => {
        const treeConfig = this.pickerTreeConfiguration;
        const cpRef = treeConfig?.TreeChildParentRefField;
        const pcRef = treeConfig?.TreeParentChildRefField;
        const cId = treeConfig?.TreeChildIdField;
        const pId = treeConfig?.TreeParentIdField;
        const cStreamName = treeConfig?.TreeLeavesStream;
        const pStreamName = treeConfig?.TreeBranchesStream;
        const optionItems = this.optionItems$.value;
        if (treeConfig?.TreeRelationship == 'parent-child') {
          return item.data[pcRef].map((x: any) => {
            const child = optionItems.find(y => (y as any)[treeConfig?.TreeChildIdField] == (x as any)[treeConfig?.TreeChildIdField]);
            return child;
          });
        } else if (treeConfig?.TreeRelationship == 'child-parent') {
          return optionItems.filter(x => {
            if (x.data[cpRef] != undefined && x.data[cpRef][0] != undefined && item != undefined)
              return x.data[cpRef][0][pId] == item.data[pId];
          });
        }
      },
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  /** Needed later for tree implementation testing */
  treeControl = new FlatTreeControl<PickerTreeItem>(
    item => item.Level,
    item => item.Expandable,
  );


  disableOption(item: PickerTreeItem, selected: PickerItem[], enableReselect: boolean): boolean {
    const treeConfig = this.pickerTreeConfiguration;
    const selectedButNoReselect = enableReselect && selected.some(entity => entity.value === item.value);
    const isRootButRootNotAllowed = treeConfig?.TreeAllowSelectRoot
      ? false
      : item.Children?.length > 0 && item.Parent?.length === 0;
    const isBranchButBranchNotAllowed = treeConfig?.TreeAllowSelectBranch
      ? false
      : item.Children?.length > 0 && item.Parent?.length > 0;
    const isLeafButLeafNotAllowed = treeConfig?.TreeAllowSelectLeaf
      ? false
      : item.Children?.length === 0;
    return selectedButNoReselect || isRootButRootNotAllowed || isBranchButBranchNotAllowed || isLeafButLeafNotAllowed;
  }

  hasChild = (_: number, item: PickerTreeItem) => item.Expandable;
}