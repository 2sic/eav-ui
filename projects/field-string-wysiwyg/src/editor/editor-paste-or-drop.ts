import { Editor } from 'tinymce';
import { Connector } from '../../../edit-types/src/Connector';
import { classLog } from '../../../shared/logging';
import { RawEditorOptionsExtended } from '../config/raw-editor-options-extended';

const logSpecs = {
  all: false,
  constructor: true,
  connectedCallback: true,
  disconnectedCallback: true,
  TinyMceInitialized: false,
  PastePreProcess: true,
};

export class EditorPasteOrDrop {
  log = classLog({ EditorPasteOrDrop }, logSpecs);
  
  isDrop = false;

  tinyMceSetup(editor: Editor, connector: Connector<string>, rawEditorOptions: RawEditorOptionsExtended): void {
    const pasteImage = connector._experimental.isFeatureEnabled['PasteImageFromClipboard'];
    
    // called before PastePreProcess
    // this is needed so drag and drop will function even if pasteClipboardImage feature is false
    // important: the { ... } brackets are necessary for `this` to be the correct object
    editor.on('drop', _event => { this.isDrop = true });

    // called before PastePreProcess
    // this is needed so paste will only work depending on pasteClipboardImage feature
    // important: the { ... } brackets are necessary for `this` to be the correct object
    editor.on('paste', _event => { this.isDrop = false });

    // called before actual image upload so _event.preventDefault(); can stop pasting
    // this is needed because only here we can read clipboard content
    editor.on('PastePreProcess', event => {
      const l = this.log.fnIf('PastePreProcess', { event });
      if (!pasteImage() && event.content.startsWith('<img src=') && !this.isDrop) {
        event.preventDefault();
        connector._experimental.featureDisabledWarning('PasteImageFromClipboard');
        return l.end('disabled');
      }
      l.end('enabled');
    });
  }
}