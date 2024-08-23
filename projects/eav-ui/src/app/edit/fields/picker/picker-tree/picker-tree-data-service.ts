import { Injectable, Injector, OnDestroy, Signal, effect, runInInjectionContext } from '@angular/core';
import { PickerTreeItem } from '../models/picker-tree.models';
import { PickerTreeDataHelper } from './picker-tree-data-helper';
import { ServiceBase } from '../../../../shared/services/service-base';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { FieldSettings, RelationshipParentChild } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerItem } from '../models/picker-item.model';

const logThis = false;

@Injectable()
export class PickerTreeDataService extends ServiceBase implements OnDestroy {
  constructor(public treeHelper: PickerTreeDataHelper, private inject: Injector) {
    super(new EavLogger('PickerTreeDataService', logThis));
  }

  ngOnDestroy(): void {
    super.destroy();
  }

  public init(fieldSettings: Signal<FieldSettings>, allItems: Signal<PickerItem[]>) {
    this.log.a('init');

    const settings = fieldSettings();
    const isTree = settings.PickerDisplayMode === 'tree';

    // if not tree, quit early, nothing has to work then
    if (!isTree) return;

    // as of now, the tree config can not change at runtime, so pick up early
    const treeConfig = settings.PickerTreeConfiguration;
    const relationshipIsParentChild = treeConfig?.TreeRelationship == RelationshipParentChild;

    runInInjectionContext(this.inject, () => {
      effect(() => {
        const all = allItems();
        // if the objects don't have a data property, we can't convert them to tree items
        // todo: not sure why this happens, possibly early cycles don't have it yet?
        const treeItems = all?.[0]?.data == null
          ? [] as PickerTreeItem[]
          : this.treeHelper.preConvertAllItems(treeConfig, all);

        if (treeItems?.[0]?.data != undefined) {
          this.treeHelper.updateConfig(treeConfig);
          this.treeHelper.addTreeItems(treeItems);

          const filteredData = treeItems.filter(x => relationshipIsParentChild //check for two streams type also
            ? !treeItems.some(y => y.data[treeConfig?.TreeParentChildRefField]?.some((z: { Id: number; }) => z.Id === x.id))
            : x.data[treeConfig?.TreeChildParentRefField]?.length == 0);
          this.treeHelper.updateSelectedData(filteredData);
        }
      });
    });
  }
}