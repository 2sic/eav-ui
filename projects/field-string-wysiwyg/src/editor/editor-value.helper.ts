import { Connector } from 'projects/edit-types/src/Connector';
import { classLogEnabled } from '../../../shared/logging';
import { EditorWithId } from './editor.types';

const logSpecs = {
  all: false,
  constructor: true,
  start: true,
  saveValue: true,
  handleExternalValueUpdate: true,
};

export class EditorValueHelper {

  log = classLogEnabled({ EditorValueHelper }, logSpecs);

  constructor(private editor: EditorWithId, private connector: Connector<string>) {
    this.log.aIf(`constructor`, { editorId: this.editor.idRandom, initialContent: editor.getContent() }, 'constructor');
  }

  /** saves editor content to prevent slow update when first using editor */
  editorContent: string;

  start() {
    const l = this.log.fnIf(`start`, { editorId: this.editor.idRandom }, 'start');
    // Initialize first value
    this.handleExternalValueUpdate(this.connector.data.value);

    this.connector.data.onValueChange(newValue => {
      console.log('onValueChange callback', { newValue, editorId: this.editor.idRandom });
      this.handleExternalValueUpdate(newValue);
    });
    l.end();
  }

  handleExternalValueUpdate(newValue: string): void {
    this.log.aIf('handleExternalValueUpdate', { newValue, editorId: this.editor.idRandom }, 'handleExternalValueUpdate');
    if (this.editorContent === newValue)
      return;
    this.editorContent = newValue;
    this.editor.setContent(this.editorContent);
  }

  saveValue(/* editor: Editor, */ connector: Connector<string>): void {
    const editor = this.editor;
    // Check what's new
    let newContent = editor.getContent();
    
    const l = this.log.fnIf(`saveValue`, { x: 'todo', editorId: editor.idRandom, newContent }, 'saveValue');

    // If the new thing is an image in the middle of an upload,
    // exit and wait for the change to be finalized
    if (newContent.includes('<img src="data:image'))
      return l.end("no image; done");

    // this is necessary for adding data-cmsid attribute to image attributes
    if (newContent.includes("?tododata-cmsid=")) {
      // imageStrings becomes array of strings where every string except first starts with 'imageName"'
      let imageStrings = newContent.split("?tododata-cmsid=");
      newContent = "";
      imageStrings.forEach((x, i) => {
        // after each string in array except last one we add '" data-cmsid="file:' attribute
        if (i != imageStrings.length - 1)
          newContent += x + '" data-cmsid="file:';
        else
          newContent += x;
      });
      editor.setContent(newContent);
    }
    // remember for change detection
    this.editorContent = newContent;

    // broadcast the change
    connector.data.update(this.editorContent);
    l.end('done')
  }
}