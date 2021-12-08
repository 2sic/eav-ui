import { EavHeader } from '../../../shared/models/eav';

export interface ContentTypeTemplateVars {
  currentLanguage: string;
  defaultLanguage: string;
  header: EavHeader;
  itemTitle: string;
  slotCanBeEmpty: boolean;
  slotIsEmpty: boolean;
  editInstructions: string;
  itemForTooltip: string;
}
