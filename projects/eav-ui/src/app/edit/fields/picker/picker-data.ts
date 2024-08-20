import { PickerItem } from './models/picker-item.model';
import { StateAdapter } from "./adapters/state-adapter";
import { TranslateService } from '@ngx-translate/core';
import { Injectable, OnDestroy, computed, inject } from '@angular/core';
import { PickerFeatures } from './picker-features.model';
import { DataAdapterBase } from './adapters/data-adapter-base';
import { EavLogger } from '../../../shared/logging/eav-logger';
import { RxHelpers } from '../../../shared/rxJs/rx.helpers';
import { ServiceBase } from '../../../shared/services/service-base';

const logThis = false;
const nameOfThis = 'PickerData';

@Injectable()
export class PickerData extends ServiceBase implements OnDestroy {

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  public state: StateAdapter;
  public source: DataAdapterBase;

  selectedAll = computed(() => this.createUIModel(this.state.selectedItems(), this.source.optionsOrHints(), this.translate));

  public selectedOne = computed(() => this.selectedAll()[0] ?? null, { equal: RxHelpers.objectsEqual });

  public features = computed(() => {
    const fromSource = this.source.features();
    const fromState = this.state.features();
    return PickerFeatures.merge(fromSource, fromState);
  }, { equal: RxHelpers.objectsEqual });

  private translate = inject(TranslateService);

  public setup(name: string, state: StateAdapter, source: DataAdapterBase): this {
    source.init(name);
    this.state = state;
    this.source = source;
    // 1. Init Prefetch - for Entity Picker
    // This will place the prefetch items into the available-items list
    // Otherwise related entities would only show as GUIDs.
    const initiallySelected = state.selectedItems();
    this.log.a('setup', { initiallySelected })
    source.initPrefetch(initiallySelected.map(item => item.value));
    return this;
  }

  ngOnDestroy() {
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
        return createPickerItem(
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

}

function createPickerItem(id: number, value: string, text: string, tooltip: string, information: string, disableEdit: boolean, disableDelete: boolean, disableSelect: boolean,): PickerItem {
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
