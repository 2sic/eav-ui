import { FormValues } from '../../../eav-item-dialog/item-edit-form/item-edit-form.models';
import { FormulaInstanceService } from '../../../shared/services/formula-instance.service';

export interface FormValueChange {
  formValues: FormValues;
  formulaInstance: FormulaInstanceService;
}
