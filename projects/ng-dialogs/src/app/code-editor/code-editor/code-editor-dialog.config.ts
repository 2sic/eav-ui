import { DialogConfig } from '../../shared/models/dialog-config.model';

export const codeEditorDialogConfig: DialogConfig = {
  // this is module root dialog and has to init context
  initContext: true,
  panelSize: 'fullscreen',
  panelClass: null,

  async getComponent() {
    const { CodeEditorComponent } = await import('./code-editor.component');
    return CodeEditorComponent;
  }
};
