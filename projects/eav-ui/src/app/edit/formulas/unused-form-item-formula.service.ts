import { inject, Injectable, Signal } from "@angular/core";
import { EntityReader } from "../shared/helpers";
import { EavLogger } from '../../shared/logging/eav-logger';
import { ItemValuesOfLanguage } from '../state/item-values-of-language.model';
import { ItemService } from '../shared/store/item.service';

const logThis = false;
const nameOfThis = 'FormItemFormulaService';

/**
 * Contains methods for updating value changes from formulas to the global state.
 * 
 * It's created in the field-settings-service and specific to one item.
 * 
 * AT THE MOMENT IT'S NOT USED, since value propagation seems to happen magically,
 * probably because the form builder has a watcher to update things.
 * BUT WE THINK something isn't quite right, so we keep this till EOY 2024.
 */
@Injectable()
export class ItemFormulaBroadcastService {

  private log = new EavLogger(nameOfThis, logThis);

  private itemService = inject(ItemService);

  valueFormulaCounter = 0;
  maxValueFormulaCycles = 5;

  private entityGuid: string;
  private reader: Signal<EntityReader>;

  init(entityGuid: string, reader: Signal<EntityReader>): void {
    this.entityGuid = entityGuid;
    this.reader = reader;
  }

  /**
   * Used to check if the value of a field should be updated with the value from a formula and if so, updates it.
   * @param formValues
   * @param fieldsProps
   * @param possibleValueUpdates
   * @param possibleFieldsUpdates
   * @param slotIsEmpty
   * @returns true if values are updated, false otherwise
   */
  applyValueChangesFromFormulas(modifiedValues: ItemValuesOfLanguage): boolean {
    const l = this.log.fn('applyValueChangesFromFormulas', { entityGuid: this.entityGuid });

    if (Object.keys(modifiedValues).length == 0)
      return l.r(false);

    if (this.maxValueFormulaCycles > this.valueFormulaCounter) {
      this.valueFormulaCounter++;
      this.itemService.updater.updateItemAttributesValues(this.entityGuid, modifiedValues, this.reader());
      // return true to make sure fieldProps are not updated yet
      return l.r(true);
    }
    return l.r(false, 'Max value formula cycles reached');
  }

}

