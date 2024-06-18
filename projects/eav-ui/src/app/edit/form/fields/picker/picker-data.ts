import { DataAdapter } from "./adapters/data-adapter.interface";
import { StateAdapter } from "./adapters/state-adapter";
import { PickerItem } from 'projects/edit-types';
import { TranslateService } from '@ngx-translate/core';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { computed } from '@angular/core';
import { PickerFeatures } from './picker-features.model';
import { RxHelpers } from 'projects/eav-ui/src/app/shared/rxJs/rx.helpers';

const logThis = false;

export class PickerData extends ServiceBase {

  selectedAll = computed(() => this.createUIModel(this.state.selectedItems(), this.source.optionsOrHints(), this.translate));

  public selectedOne = computed(() => this.selectedAll()[0] ?? null, { equal: RxHelpers.objectsEqual });

  public features = computed(() => {
    const fromSource = this.source.features();
    const fromState = this.state.features();
    return PickerFeatures.merge(fromSource, fromState);
  }, { equal: RxHelpers.objectsEqual });

  constructor(
    public state: StateAdapter,
    public source: DataAdapter,
    private translate: TranslateService,
    /** the injector is needed so that signals can destroy when they are not needed any more */
    // injector: Injector,
  ) {
    super(new EavLogger('PickerData', logThis));

    // 1. Init Prefetch - for Entity Picker
    // This will place the prefetch items into the available-items list
    // Otherwise related entities would only show as GUIDs.
    const initiallySelected = state.selectedItems();
    source.initPrefetch(initiallySelected.map(item => item.value));
  }

  override destroy() {
    this.source.destroy();
    this.state.destroy();
    super.destroy();
  }

  private createUIModel(
    selectedItems: PickerItem[],
    data: PickerItem[],
    translate: TranslateService,
  ): PickerItem[] {
    const selectedEntities = selectedItems.map(item => {
      const entity = data.find(e => e.value === item.value);
      if (!entity) {
        return item;
      } else {
        const text = entity.label ?? translate.instant('Fields.Picker.EntityNotFound');
        return this.createPickerItem(
          entity.id,
          entity.value,
          text,
          entity.tooltip ?? `${text} (${entity.value})`,
          entity.infoBox ?? '',
          entity.noEdit === true,
          entity.noDelete === true,
          false,
        );
      }
    });

    return selectedEntities;
  }

  private createPickerItem(id: number, value: string, text: string, tooltip: string, information: string, disableEdit: boolean, disableDelete: boolean, disableSelect: boolean,): PickerItem { 
    return {
      id: id,
      value: value,
      label: text,
      tooltip: tooltip,
      infoBox: information,
      noEdit: disableEdit,
      noDelete: disableDelete,
      notSelectable: disableSelect,
    } as PickerItem;
  }
}