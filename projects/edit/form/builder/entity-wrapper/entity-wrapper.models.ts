import { EavHeader } from '../../../shared/models/eav';

export interface ContentTypeTemplateVars {
  readOnly: boolean;
  currentLanguage: string;
  defaultLanguage: string;
  header: EavHeader;
  itemTitle: string;
  slotCanBeEmpty: boolean;
  slotIsEmpty: boolean;
  editInstructions: string;
  itemForTooltip: string;
}
