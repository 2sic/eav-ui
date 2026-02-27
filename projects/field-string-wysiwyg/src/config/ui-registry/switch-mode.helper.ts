import * as DialogModes from '../../constants/display-modes';
import * as EditModes from '../../constants/edit-modes';
import { AddToRegistryParams } from './add-to-registry-base';


export class SwitchModeHelper {

  constructor(private makerParams: AddToRegistryParams) {
  }

  register(): void { throw new Error('Method not implemented.'); }

  /** Mode switching to inline/dialog and advanced/normal */
  public switchMode(displayMode: DialogModes.DisplayModes | null, editMode: EditModes.WysiwygEditMode | null): void {
    const options = this.makerParams.options;
    const field = this.makerParams.field;
    const currMode = options.configManager.current;
    displayMode ??= currMode.displayMode;
    editMode ??= currMode.editMode;
    const isDebug = field.connector._experimental.isDebug();
    const newSettings = options.configManager.switch(editMode, displayMode, isDebug);
    // don't create a new object, we must keep a reference to the previous parent `options`.
    // don't do this: this.options = {...this.options, ...newSettings};
    options.toolbar = newSettings.toolbar;
    options.menubar = newSettings.menubar;
    options.contextmenu = newSettings.contextmenu;
    // refresh editor toolbar
    const editor = this.makerParams.editor;
    editor.editorManager.remove(editor);
    editor.editorManager.init(options);
  }

}