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

export function getNoteProps(note: EavEntity, currentLanguage: string, defaultLanguage: string): NoteProps {
  const noteProps: NoteProps = {
    note,
    tooltip: 'Form.Buttons.Note.Add',
    cssClass: 'no-note',
    iconName: 'sticky_note_2',
    noteHtml: undefined,
  };
  if (!note) { return noteProps; }

  noteProps.tooltip = undefined;
  noteProps.noteHtml = LocalizationHelpers.translate(currentLanguage, defaultLanguage, note.Attributes.Note, null);

  const noteType = LocalizationHelpers.translate(currentLanguage, defaultLanguage, note.Attributes.NoteType, null);
  if (noteType === 'note') {
    noteProps.cssClass = 'has-note';
  } else if (noteType === 'warning') {
    noteProps.cssClass = 'has-warning';
    noteProps.iconName = 'warning_amber';
  }
  return noteProps;
}
