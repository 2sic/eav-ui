import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { PickerItem, RelationshipChildParent, RelationshipParentChild, UiPickerModeTree } from 'projects/edit-types';
import { PickerTreeItem } from '../models/picker-tree.models';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';

const logThis = true;

export class PickerTreeDataHelper extends ServiceBase {

  public treeFlattener: MatTreeFlattener<PickerItem, PickerTreeItem>;
  private pickerTreeConfiguration: UiPickerModeTree;
  private optionItems$: BehaviorSubject<PickerItem[]>;

  dataSource: MatTreeFlatDataSource<PickerItem, PickerTreeItem, PickerTreeItem>

  constructor() {
    super(new EavLogger('PickerTreeHelper', logThis));

    this.build();
  }

    /** Needed later for tree implementation testing */
  public static treeControl = new FlatTreeControl<PickerTreeItem>(
    item => item.level,
    item => item.expandable,
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
      // transformFunction converts an item to a tree-item
      (item: PickerItem, level: number): PickerTreeItem => {
        const log = new EavLogger('transformFunction', logThis);
        log.add(`item: ${item?.id}`, item);
        const treeConfig = this.pickerTreeConfiguration;
        if (!treeConfig) throw new Error('No tree configuration found');

        if (!item) throw new Error("Can't transform null-item");

        const isParentChild = treeConfig.TreeRelationship == RelationshipParentChild;
        const cpRef = treeConfig.TreeChildParentRefField;
        const pcRef = treeConfig.TreeParentChildRefField;
        const cId = treeConfig.TreeChildIdField;
        const pId = treeConfig.TreeParentIdField;
        const cStreamName = treeConfig.TreeLeavesStream;
        const pStreamName = treeConfig.TreeBranchesStream;
        const allItems = this.optionItems$.value;
        const itemInCorrectStream = allItems
          .filter(x => !x.sourceStreamName || x.sourceStreamName == pStreamName)
          .find(x => x == item);
        
        const expandable = isParentChild
            ? itemInCorrectStream && (item.data[pcRef]?.length > 0 ?? false)
            : itemInCorrectStream && !!allItems.find(x => {
              return (x.data[cpRef]?.[0]?.[pId] == item?.data?.[pId])
                // return x.data[cpRef][0][pId] == item.data[pId]
            }
          );
        
        const result: PickerTreeItem = {
          level: level,
          expandable: expandable,
          value: item.value,
          label: item.label,
          parent: item.data[cpRef],
          children: item.data[pcRef],
          tooltip: item.tooltip,
          infoBox: item.infoBox,
          helpLink: item.helpLink,
        };
        log.add('result', result);
        return result;
      },
      // getLevel
      (item): number => { return item.level; },

      // isExpandable
      (item): boolean => { return item.expandable; },

      // getChildren
      (item): PickerItem[] => {
        const treeConfig = this.pickerTreeConfiguration;
        const isParentChild = treeConfig.TreeRelationship == RelationshipParentChild;
        const cpRef = treeConfig.TreeChildParentRefField;
        const pcRef = treeConfig.TreeParentChildRefField;
        const cId = treeConfig.TreeChildIdField;
        const pId = treeConfig.TreeParentIdField;
        const allItems = this.optionItems$.value;
        if (isParentChild)
          return item.data[pcRef].map((x: any) => {
            const child = allItems.find(y => (y as any)[cId] == (x as any)[cId]);
            return child;
          });
        else if (treeConfig.TreeRelationship == RelationshipChildParent)
          return allItems.filter(x => {
            if (x.data[cpRef] != undefined && x.data[cpRef][0] != undefined && item != undefined)
              return x.data[cpRef][0][pId] == item.data[pId];
          });
        else
          throw new Error(`Unknown tree relationship: "${treeConfig?.TreeRelationship}"`);
      },
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  /** Needed later for tree implementation testing */
  treeControl = new FlatTreeControl<PickerTreeItem>(
    item => item.level,
    item => item.expandable,
  );


  disableOption(item: PickerTreeItem, selected: PickerItem[], enableReselect: boolean): boolean {
    const treeConfig = this.pickerTreeConfiguration;
    const selectedButNoReselect = enableReselect && selected.some(entity => entity.value === item.value);
    const isRootButRootNotAllowed = treeConfig?.TreeAllowSelectRoot
      ? false
      : item.children?.length > 0 && item.parent?.length === 0;
    const isBranchButBranchNotAllowed = treeConfig?.TreeAllowSelectBranch
      ? false
      : item.children?.length > 0 && item.parent?.length > 0;
    const isLeafButLeafNotAllowed = treeConfig?.TreeAllowSelectLeaf
      ? false
      : item.children?.length === 0;
    return selectedButNoReselect || isRootButRootNotAllowed || isBranchButBranchNotAllowed || isLeafButLeafNotAllowed;
  }

  hasChild = (_: number, item: PickerTreeItem) => item.expandable;
}