import { EavEntity } from '../shared/models/eav';

export interface NoteProps {
  note: EavEntity;
  tooltip: string;
  noteHtml: string;
  triggerClass: string;
  noteClass: string;
  iconName: string;
  itemNotSaved: boolean;
}
