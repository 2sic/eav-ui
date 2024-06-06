import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { PickerItem, RelationshipChildParent, RelationshipParentChild, UiPickerModeTree } from 'projects/edit-types';
import { PickerTreeItem } from '../models/picker-tree.models';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Injectable } from '@angular/core';

const logThis = false;

@Injectable()
export class PickerTreeDataHelper extends ServiceBase {

  private pickerTreeConfiguration: UiPickerModeTree;
  private treeItems: PickerTreeItem[];

  dataSource: MatTreeFlatDataSource<PickerItem, PickerTreeItem, PickerTreeItem>

  constructor() {
    super(new EavLogger('PickerTreeHelper', logThis));

    this.build();
  }

  public updateConfig(pickerConfig: UiPickerModeTree) {
    this.log.a('updateConfigAndSelectedData');
    // set config, which will be accessed on 'this.' whenever it's needed
    this.pickerTreeConfiguration = pickerConfig;
  }

  public addTreeItems(treeItems: PickerTreeItem[]) {
    this.log.a('addTreeItems');
    this.treeItems = treeItems;
  }

  public updateSelectedData(selectedData: PickerItem[]) {
    this.log.a('updateSelectedData');
    this.dataSource.data = selectedData;
  }

  public preConvertAllItems(treeConfig: UiPickerModeTree, items: PickerItem[]) {
    this.log.a('preConvertAllItemsToTreeItems', [treeConfig, items]);
    const convertedItems = items.map(x => this.preConvertItemToTreeItem(treeConfig, x, items));

    // todo: establish relationships
    const withChildren = convertedItems.map(x => {
      if (!x.expandable) return x;
      const children = this.getChildren(treeConfig, x, convertedItems);
      // important: don't use spread, we really want to modify the object
      // so that all object correctly reference each other
      x.children = children;
      return x;
      // return { ...x, children };
    });
    // todo: open collapse first level...

    return withChildren;
  }
  
  private preConvertItemToTreeItem(treeConfig: UiPickerModeTree, item: PickerItem, allItems: PickerItem[]) {
    // Log and do some initial checks
    this.log.a(`preConvertItemToTreeItem for item ${item?.id}`, [treeConfig, item, allItems]);
    if (!treeConfig) throw new Error('No tree configuration found');
    if (!item) throw new Error("Can't transform null-item");

    // Get the tree configuration
    const isParentChild = treeConfig.TreeRelationship == RelationshipParentChild;
    const cpRef = treeConfig.TreeChildParentRefField;
    const pcRef = treeConfig.TreeParentChildRefField;
    const cId = treeConfig.TreeChildIdField;
    const pId = treeConfig.TreeParentIdField;
    const cStreamName = treeConfig.TreeLeavesStream;
    const pStreamName = treeConfig.TreeBranchesStream;
    const itemInCorrectStream = allItems
      .filter(x => !x.sourceStreamName || x.sourceStreamName == pStreamName)
      .find(x => x == item);

    // figure out if this node can be expanded
    // todo: first variant isParentChild probably doesn't work yet
    const currentId = item?.data?.[pId];
    const expandable = isParentChild
      ? itemInCorrectStream && (item.data[pcRef]?.length > 0 ?? false)
      : itemInCorrectStream && !!allItems.find(x => {
        return (x.data[cpRef]?.[0]?.[pId] == currentId)
      }
    );
  
    const result: PickerTreeItem = {
      ...item,
      level: -1,
      expandable: expandable,
      parent: item.data[cpRef],
      children: item.data[pcRef],
    };
    this.log.a('result', [result]);
    return result;
  }

  public build() {
    this.log.a('build');

    const treeFlattener = new MatTreeFlattener(
      // transformFunction converts an item to a tree-item
      (item: PickerTreeItem, level: number): PickerTreeItem => ({
        ...item,
        level,
      }),

      // getLevel
      (item): number => { return item.level; },

      // isExpandable
      (item): boolean => { return item.expandable; },

      // getChildren
      (item): PickerTreeItem[] => {
        // TODO: @2dm - must determine which method is better
        // getting them here is a bit more functional, but the other model doesn't need the catalog to be stored separately

        // return item.children; // 
        // const getChildren = this.getChildren(this.pickerTreeConfiguration, item, this.treeItems);
        // console.warn('2dm item', item, 'getChildren', getChildren, 'item.children', item.children)
        // return getChildren;
        return item.children;
      },
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
  }

  private getChildren(treeConfig: UiPickerModeTree, item: PickerTreeItem, allItems: PickerTreeItem[]) {
    const isParentChild = treeConfig.TreeRelationship == RelationshipParentChild;
    const cpRef = treeConfig.TreeChildParentRefField;
    const pcRef = treeConfig.TreeParentChildRefField;
    const cId = treeConfig.TreeChildIdField;
    const pId = treeConfig.TreeParentIdField;
    if (isParentChild)
      return item.data[pcRef].map((x: any) => {
        const child = allItems.find(y => (y as any)[cId] == (x as any)[cId]);
        return child;
      });
    else if (treeConfig.TreeRelationship == RelationshipChildParent) {
      const itemParentValue = item.data?.[pId];
      // console.log(`RelationshipChildParent - 2dm for parentIdField: '${pId}' on item: '${itemParentValue}' with parent having id field '${cId}' `);
      return allItems.filter(x => {
        const childParentId = x.data[cpRef]?.[0]?.[pId];
        return childParentId == itemParentValue;
      });
    }
    else
      throw new Error(`Unknown tree relationship: "${treeConfig?.TreeRelationship}"`);
  }

  /** Needed by material tree to somehow determine the properties */
  treeControl = new FlatTreeControl<PickerTreeItem>(
    item => item.level,
    item => item.expandable,
  );


  disableOption(item: PickerTreeItem, selected: PickerItem[], enableReselect: boolean): boolean {
    const treeConfig = this.pickerTreeConfiguration;
    const selectedButNoReselect = enableReselect
      ? false
      : selected.some(entity => entity.value === item.value);

    // test code to verify functionality
    // if (item.label?.indexOf('Kawasaki') > -1) {
    //   this.log.enabled = true;
    //   this.log.a('disableOption', item, selected, enableReselect, selectedButNoReselect);
    //   this.log.enabled = false;
    // }

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