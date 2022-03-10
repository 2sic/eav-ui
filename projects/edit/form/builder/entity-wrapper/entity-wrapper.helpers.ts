import { TranslateService } from '@ngx-translate/core';
import { LocalizationHelpers } from '../../../shared/helpers';
import { EavEntity, EavFor } from '../../../shared/models/eav';
import { NoteProps } from './entity-wrapper.models';

export function getItemForTooltip(itemFor: EavFor, translate: TranslateService) {
  if (!itemFor) { return; }
  return translate.instant('Form.Buttons.Metadata.Tip')
    + `\nTarget: ${itemFor.Target}`
    + `\nTargetType: ${itemFor.TargetType}`
    + (itemFor.Number ? `\nNumber: ${itemFor.Number}` : '')
    + (itemFor.String ? `\nString: ${itemFor.String}` : '')
    + (itemFor.Guid ? `\nGuid: ${itemFor.Guid}` : '')
    + (itemFor.Title ? `\nTitle: ${itemFor.Title}` : '');
}

export function getNoteProps(note: EavEntity, currentLanguage: string, defaultLanguage: string, itemNotSaved: boolean): NoteProps {
  const noteProps: NoteProps = {
    note,
    tooltip: itemNotSaved ? 'Form.Buttons.Note.ItemNotSaved' : 'Form.Buttons.Note.Add',
    triggerClass: `no-note ${itemNotSaved ? 'item-not-saved' : ''}`,
    iconName: 'sticky_note_2',
    noteClass: '',
    noteHtml: undefined,
    itemNotSaved,
  };
  if (!note) { return noteProps; }

  noteProps.tooltip = undefined;
  noteProps.noteHtml = LocalizationHelpers.translate(currentLanguage, defaultLanguage, note.Attributes.Note, null);

  const noteType = LocalizationHelpers.translate(currentLanguage, defaultLanguage, note.Attributes.NoteType, null);
  if (noteType === 'note') {
    noteProps.triggerClass = 'has-note';
  } else if (noteType === 'warning') {
    noteProps.triggerClass = 'has-warning';
    noteProps.iconName = 'warning_amber';
    noteProps.noteClass = 'warning';
  }
  return noteProps;
}
