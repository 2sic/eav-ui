import { FormulaIdentifier } from '../results/formula-results.models';


export interface DesignerState extends FormulaIdentifier {
  editMode: boolean;
  isOpen: boolean;
}
