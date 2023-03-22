import { BehaviorSubject, Observable } from 'rxjs';
import { ControlStatus } from '../../../shared/models';
import { FieldConfigSet } from '../../builder/fields-builder/field-config-set.model';
import { SelectedEntity } from '../entity/entity-default/entity-default.models';
import { ReorderIndexes } from './picker-list/picker-list.models';

export class PickerStateAdapter {
  config: FieldConfigSet;

  freeTextMode$: BehaviorSubject<boolean>;
  disableAddNew$: BehaviorSubject<boolean>;
  controlStatus$: BehaviorSubject<ControlStatus<string | string[]>>;
  error$: BehaviorSubject<string>;

  selectedEntities$: Observable<SelectedEntity[]>;
  label$: Observable<string>;
  placeholder$: Observable<string>;
  required$: Observable<boolean>;

  addSelected(guid: string) { }
  removeSelected(index: number) { }
  reorder(reorderIndexes: ReorderIndexes) { }
  toggleFreeTextMode() { }
}
