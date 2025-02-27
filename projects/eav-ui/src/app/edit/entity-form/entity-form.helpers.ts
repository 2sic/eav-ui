import { TranslateService } from '@ngx-translate/core';
import { FormLanguage } from '../form/form-languages.model';
import { EntityReader } from '../shared/helpers';
import { EavEntity, EavFor } from '../shared/models/eav';
import { NoteProps } from './note-props.model';

export function getItemForTooltip(itemFor: EavFor, translate: TranslateService) {
  if (!itemFor) return;
  return translate.instant('Form.Buttons.Metadata.Tip')
    + `\nTarget: ${itemFor.Target}`
    + `\nTargetType: ${itemFor.TargetType}`
    + (itemFor.Number ? `\nNumber: ${itemFor.Number}` : '')
    + (itemFor.String ? `\nString: ${itemFor.String}` : '')
    + (itemFor.Guid ? `\nGuid: ${itemFor.Guid}` : '')
    + (itemFor.Title ? `\nTitle: ${itemFor.Title}` : '');
}

export function getNoteProps(note: EavEntity, language: FormLanguage, itemNotSaved: boolean): NoteProps {
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
  const reader = new EntityReader(language);
  noteProps.noteHtml = reader.getBestValue(note.Attributes.Note);

  const noteType = reader.getBestValue(note.Attributes.NoteType);
  if (noteType === 'note') {
    noteProps.triggerClass = 'has-note';
  } else if (noteType === 'warning') {
    noteProps.triggerClass = 'has-warning';
    noteProps.iconName = 'warning';
    noteProps.noteClass = 'warning';
  }
  return noteProps;
}

export function buildContentTypeFeatures(contentTypeFeatures: string): Record<string, boolean> {
  const features = contentTypeFeatures
    .split('\n')
    .reduce((result, contentTypeFeature) => {
      if (!contentTypeFeature)
        return result;
      const nameAndValue = contentTypeFeature.split('=');
      const name = nameAndValue[0];
      const value = nameAndValue[1] === 'true';
      result[name] = value;
      return result;
    }, {} as Record<string, boolean>);
  return features;
}
