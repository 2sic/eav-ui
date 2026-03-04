import { Editor, EditorManager } from 'tinymce';
import { Adam } from '../../../../edit-types/src/Adam';
import { FieldStringWysiwygEditor } from '../../field-string-wysiwyg/field-string-wysiwyg-editor';
import { RawEditorOptionsExtended } from '../raw-editor-options-extended';

/** Helper to ensure add-to-registry params don't always change on every implementing class */
export interface AddToRegistryParams {
  field: FieldStringWysiwygEditor;
  editor: Editor;
  manager: EditorManager;
  adam: Adam;
  options: RawEditorOptionsExtended;
}
