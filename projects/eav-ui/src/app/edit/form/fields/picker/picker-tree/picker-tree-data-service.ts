import { Injectable } from '@angular/core';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { FieldSettings, PickerItem, RelationshipParentChild } from 'projects/edit-types';
import { Observable, combineLatest, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { PickerTreeItem } from '../models/picker-tree.models';
import { PickerTreeDataHelper } from './picker-tree-data-helper';

const logThis = true;

@Injectable()
export class PickerTreeDataService extends ServiceBase {
  constructor(public treeHelper: PickerTreeDataHelper) {
    super(new EavLogger('PickerTreeDataService', logThis));
  }

  override destroy() {
    super.destroy();
  }

  public init(fieldSettings$: Observable<FieldSettings>, allItems$: Observable<PickerItem[]>) {
    this.log.add('init');

    // Get only tree settings, make sure they don't fire unless they really change
    const logTreeSettings = this.log.rxTap('treeSettings$');
    const treeSettings$ = combineLatest([
      fieldSettings$.pipe(
        map(settings => ({
          displayMode: settings.PickerDisplayMode,
          isTree: settings.PickerDisplayMode === 'tree',
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
      // this is handled separately, so change-detection is property based, not object-reference based
      fieldSettings$.pipe(
        map(settings => settings.PickerTreeConfiguration),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ),
    ]).pipe(
      logTreeSettings.pipe(),
      map(([modeAndIsTree, pickerTreeConfig]) => ({
        ...modeAndIsTree,
        pickerTreeConfig,
      })),
      shareReplay(1),
      logTreeSettings.shareReplay(),
    );
    
    // Create the tree data stream, make sure it only fires if things really change
    const treeDataLog = this.log.rxTap('treeData$');
    const treeData$ = combineLatest([
      allItems$.pipe(treeDataLog.part('optionItems$')),
      treeSettings$.pipe(treeDataLog.part('treeSettings$')),
    ]).pipe(
      treeDataLog.pipe(),
      map(([allItems, settings]) => {
        if (!settings.isTree) //  && allItems && allItems[0]?.data != undefined) {
          return [] as PickerTreeItem[];

        // if the objects don't have a data property, we can't convert them to tree items
        // todo: not sure why this happens, possibly early cycles don't have it yet?
        if (allItems?.[0]?.data == null)
          return [] as PickerTreeItem[];

        return this.treeHelper.preConvertAllItems(settings.pickerTreeConfig, allItems);
        // return allItems.map(itm => this.treeHelper.preConvertItemToTreeItem(settings.pickerTreeConfig, itm, allItems));   
      }),
      treeDataLog.map(),
      distinctUntilChanged(GeneralHelpers.arraysEqual),
      shareReplay(1),
      treeDataLog.shareReplay(),
    );
    
    const treeLog = this.log.rxTap('tree$', { enabled: true });
    const tree$ = combineLatest([
      treeData$,
      treeSettings$
    ]).pipe(
        treeLog.pipe(),
      )
      .subscribe(([treeItems, settings]) => {
        if (!settings.isTree) 
          return;

        if (treeItems?.[0]?.data != undefined) {
          const treeConfig = settings.pickerTreeConfig;
          this.treeHelper.updateConfig(treeConfig);
          this.treeHelper.addTreeItems(treeItems);

          const filteredData = treeItems.filter(x => (treeConfig?.TreeRelationship == RelationshipParentChild) //check for two streams type also
            ? !treeItems.some(y => y.data[treeConfig?.TreeParentChildRefField]?.some((z: { Id: number; }) => z.Id === x.id))
            : x.data[treeConfig?.TreeChildParentRefField]?.length == 0);
          this.treeHelper.updateSelectedData(filteredData);
        }
      });
    this.subscriptions.add(tree$);

  }
}