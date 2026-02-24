import { Connector } from 'projects/edit-types/src/Connector';
import { Editor } from 'tinymce';
import { classLog } from '../../../shared/logging';

const logSpecs = {
  all: false,
  saveValue: false,
  handleExternalValueUpdate: false,
};

export class EditorValueHelper {
  log = classLog({ EditorValueHelper }, logSpecs);

  constructor(private editor: Editor) { }

  /** saves editor content to prevent slow update when first using editor */
  editorContent: string;

  handleExternalValueUpdate(newValue: string): void {
    this.log.aIf('handleExternalValueUpdate', { newValue });
    if (this.editorContent === newValue)
      return;
    this.editorContent = newValue;
    this.editor.setContent(this.editorContent);
  }

  saveValue(editor: Editor, connector: Connector<string>): void {
    const l = this.log.fnIf(`saveValue`);
    // Check what's new
    let newContent = editor.getContent();

    // If the new thing is an image in the middle of an upload,
    // exit and wait for the change to be finalized
    if (newContent.includes('<img src="data:image'))
      return;

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