import { MetadataItem } from '../../../../ng-dialogs/src/app/metadata';
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
  note: MetadataItem;
  noteProps: NoteProps;
}

export interface NoteProps {
  translationKey: string;
  cssClass: string;
  iconName: string;
}
