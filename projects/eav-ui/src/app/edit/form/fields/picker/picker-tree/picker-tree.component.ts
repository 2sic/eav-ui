import { Component, Input, OnInit } from '@angular/core';
import { MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { PickerIconHelpComponent } from '../picker-search/picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-search/picker-icon-info/picker-icon-info.component';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { TippyStandaloneDirective } from 'projects/eav-ui/src/app/shared/directives/tippy-Standalone.directive';
import { PickerSearchViewModel } from '../picker-search/picker-search.models';
import { PickerTreeItem, TreeItem } from '../models/picker-tree.models';
import { PickerItem } from '../models/picker-item.model';
import { UiPickerModeTree } from 'projects/edit-types/src/FieldSettings';
import { FieldsSettingsService } from '../../../../shared/services';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { BehaviorSubject } from 'rxjs';
import { PickerTreeDataHelper } from './picker-tree-data-helper';

const logThis = true;

@Component({
  selector: 'app-picker-tree',
  standalone: true,
  imports: [
    MatIconModule,
    MatOptionModule,
    MatTreeModule,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
    TippyStandaloneDirective,
  ],
  templateUrl: './picker-tree.component.html',
})
export class PickerTreeComponent extends ServiceBase implements OnInit {

  @Input() vm: PickerSearchViewModel;
  @Input() config: FieldConfigSet;
  @Input() optionItems$: BehaviorSubject<PickerItem[]>;

  @Input() pickerTreeConfiguration: UiPickerModeTree;

  /**
   * The tree helper must be generated early, and then populated later
   */
  treeHelper = new PickerTreeDataHelper();


  constructor(
    private fieldsSettingsService: FieldsSettingsService,
  ) {
    super(new EavLogger('PickerTreeComponent', logThis));
    this.log.add('constructor');
  }

  ngOnInit(): void {
    this.log.add('ngOnInit', this.vm, this.config, this.optionItems$);
    // this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    // const setLog = this.log.rxTap('settings$');
    // const settings$ = this.fieldsSettingsService.getFieldSettings$(this.config.fieldName).pipe(
    //   setLog.pipe(),
    //   map(settings => ({
    //     // AllowMultiValue: settings.AllowMultiValue,
    //     // EnableAddExisting: settings.EnableAddExisting,
    //     // EnableTextEntry: settings.EnableTextEntry,
    //     // EnableEdit: settings.EnableEdit,
    //     // EnableDelete: settings.EnableDelete,
    //     // EnableRemove: settings.EnableRemove,
    //     // EnableReselect: settings.EnableReselect,
    //     // PickerDisplayMode: settings.PickerDisplayMode,
    //     PickerTreeConfiguration: settings.PickerTreeConfiguration,
    //   })),
    //   // tap(settings => {
    //   //   this.pickerTreeConfiguration = settings.PickerTreeConfiguration;
    //   // }),
    //   setLog.part('tap'),
    //   distinctUntilChanged(GeneralHelpers.objectsEqual),
    //   setLog.distinctUntilChanged(),
    //   take(1),
    // ).subscribe();
    // this.subscriptions.add(settings$);

    // this.subscriptions.add(
    //   this.optionItems$.subscribe(optionItems => {
    //     if (optionItems && optionItems[0]?.data != undefined) {
    //       // TODO: this is a wild side-effect!
    //       const treeConfig = /* this.pickerTreeConfiguration = settings*/ this.pickerTreeConfiguration;
    //       const filteredData = optionItems.filter(x => (treeConfig?.TreeRelationship == 'parent-child') //check for two streams type also
    //         ? !optionItems.some(y => y.data[treeConfig?.TreeParentChildRefField]?.some((z: { Id: number; }) => z.Id === x.id))
    //         : x.data[treeConfig?.TreeChildParentRefField]?.length == 0);
    //       this.dataSource.data = filteredData;
    //     }
    //   })
    // );
  }


  hasChild = (_: number, item: PickerTreeItem) => this.treeHelper.hasChild(_, item);


  treeFlattener: MatTreeFlattener<TreeItem, PickerTreeItem> = new MatTreeFlattener(
    (item, Level): PickerTreeItem => {
      const treeConfig = this.pickerTreeConfiguration;
      const cpRef = treeConfig?.TreeChildParentRefField;
      const pcRef = treeConfig?.TreeParentChildRefField;
      const cId = treeConfig?.TreeChildIdField;
      const pId = treeConfig?.TreeParentIdField;
      const cStreamName = treeConfig?.TreeLeavesStream;
      const pStreamName = treeConfig?.TreeBranchesStream;
      const itemInCorrectStream = this.optionItems$.value.filter(x => !x.sourceStreamName || x.sourceStreamName == pStreamName).find(x => x == item);
      const expandable = (treeConfig?.TreeRelationship == 'parent-child')
          ? itemInCorrectStream && !!item.data[pcRef] && item.data[pcRef].length > 0
          : itemInCorrectStream && !!this.optionItems$.value.find(x => {
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
      if (treeConfig?.TreeRelationship == 'parent-child') {
        return item.data[pcRef].map((x: any) => {
          const child = this.optionItems$.value.find(y => (y as any)[treeConfig?.TreeChildIdField] == (x as any)[treeConfig?.TreeChildIdField]);
          return child;
        });
      } else if (treeConfig?.TreeRelationship == 'child-parent') {
        return this.optionItems$.value.filter(x => {
          if (x.data[cpRef] != undefined && x.data[cpRef][0] != undefined && item != undefined)
            return x.data[cpRef][0][pId] == item.data[pId];
        });
      }
    },
  );
}
