import { MetadataItem } from '../../../../ng-dialogs/src/app/metadata';
import { NoteProps } from './entity-wrapper.models';

export function getNoteProps(note?: MetadataItem): NoteProps {
  const noteProps: NoteProps = {
    translationKey: 'Form.Buttons.Note.Add',
    cssClass: 'no-note',
    iconName: 'sticky_note_2',
  };
  if (note?.NoteType === 'note') {
    noteProps.translationKey = 'Form.Buttons.Note.Note';
    noteProps.cssClass = 'has-note';
  } else if (note?.NoteType === 'warning') {
    noteProps.translationKey = 'Form.Buttons.Note.Warning';
    noteProps.cssClass = 'has-warning';
    noteProps.iconName = 'warning_amber';
  }
  return noteProps;
}
