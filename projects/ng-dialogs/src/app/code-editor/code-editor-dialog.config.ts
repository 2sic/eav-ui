import { DialogConfig } from '../shared/models/dialog-config.model';

export const codeEditorDialog: DialogConfig = {
  name: 'CODE_EDITOR_DIALOG',
  initContext: true,
  panelSize: 'fullscreen',
  panelClass: null,

  async getComponent() {
    const { CodeEditorComponent } = await import('./code-editor.component');
    return CodeEditorComponent;
  }
};
