import { ItemIdentifierHeader } from 'projects/eav-ui/src/app/shared/models/edit-form.model';
import { EavEntity } from '../../../shared/models/eav';

export interface ContentTypeTemplateVars {
  readOnly: boolean;
  currentLanguage: string;
  defaultLanguage: string;
  header: ItemIdentifierHeader;
  itemTitle: string;
  slotCanBeEmpty: boolean;
  slotIsEmpty: boolean;
  editInstructions: string;
  itemForTooltip: string;
  noteProps: NoteProps;
  showNotes: boolean;
  showMetadataFor: boolean;
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
