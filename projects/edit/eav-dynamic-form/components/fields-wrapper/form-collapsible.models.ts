import { EavHeader } from '../../../shared/models/eav';

export interface FormCollapsibleTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  header: EavHeader;
  itemTitle: string;
  slotCanBeEmpty: boolean;
  slotIsEmpty: boolean;
  editInstructions: string;
}
