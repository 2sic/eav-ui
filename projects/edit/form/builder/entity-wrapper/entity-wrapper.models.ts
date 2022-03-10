import { EavEntity, EavHeader } from '../../../shared/models/eav';

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
  noteProps: NoteProps;
}

export interface NoteProps {
  note: EavEntity;
  tooltip: string;
  noteHtml: string;
  triggerClass: string;
  noteClass: string;
  iconName: string;
  itemNotSaved: boolean;
}
