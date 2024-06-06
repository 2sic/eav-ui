import { Component, Input, OnInit } from '@angular/core';
import { MatTreeModule } from '@angular/material/tree';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { TippyStandaloneDirective } from 'projects/eav-ui/src/app/shared/directives/tippy-Standalone.directive';
import { PickerSearchViewModel } from '../picker-search/picker-search.models';
import { PickerTreeItem } from '../models/picker-tree.models';
import { PickerItem } from '../models/picker-item.model';
import { UiPickerModeTree } from 'projects/edit-types/src/FieldSettings';
import { FieldsSettingsService } from '../../../../shared/services';
import { FieldConfigSet } from '../../../builder/fields-builder/field-config-set.model';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { BehaviorSubject } from 'rxjs';
import { PickerTreeDataHelper } from './picker-tree-data-helper';

const logThis = false;

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
    this.log.a('constructor');
  }

  ngOnInit(): void {
    this.log.a('ngOnInit', [this.vm, this.config, this.optionItems$]);
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

}
