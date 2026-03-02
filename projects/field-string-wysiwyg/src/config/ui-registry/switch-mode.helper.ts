import { DisplayModes } from '../../constants/display-modes';
import * as EditModes from '../../constants/edit-modes';
import { AddToRegistryParams } from './add-to-registry-params';

export class SwitchModeHelper {

  constructor(private makerParams: AddToRegistryParams) {
  }

  /** Mode switching to inline/dialog and advanced/normal */
  public switchMode(displayMode: DisplayModes | null, editMode: EditModes.WysiwygEditMode | null): void {
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
    const manager = this.makerParams.manager;
    manager.remove(this.makerParams.editor);
    manager.init(this.makerParams.options);
  }

}