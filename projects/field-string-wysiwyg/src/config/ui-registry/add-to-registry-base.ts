import { Adam } from 'projects/edit-types';
import { Editor } from 'tinymce';
import { wysiwygEditorHtmlTag } from '../../../internal-constants';
import * as DialogModes from '../../constants/display-modes';
import * as EditModes from '../../constants/edit-modes';
import { FieldStringWysiwygEditor } from '../../editor/editor';
import { RawEditorOptionsExtended } from '../raw-editor-options-extended';

type FuncVoid = () => void | unknown;

/** Helper to ensure add-to-registry params don't always change on every implementing class */
export interface AddToRegistryParams {
  field: FieldStringWysiwygEditor;
  editor: Editor;
  adam: Adam;
  options: RawEditorOptionsExtended;
}

/**
 * Base class for tools which add buttons to tinymce
 * Important to split code a bit
 */
export abstract class AddToRegistryBase {

  field: FieldStringWysiwygEditor;
  editor: Editor;
  adam: Adam;
  options: RawEditorOptionsExtended;

  constructor(makerParams: AddToRegistryParams, message?: string) {
    this.field = makerParams.field;
    this.editor = makerParams.editor;
    this.adam = makerParams.adam;
    this.options = makerParams.options;

    // if (message) console.log('2dm - debug AddToRegistryBase', message, makerParams, this);
  }

  /**
   * Get the current selection in the DOM
   * Note that this was copied from somewhere, so we don't really know what it does ;)
   */
  protected rangeSelected() {
    return document.getSelection().rangeCount > 0 && !document.getSelection().getRangeAt(0).collapsed;
  }

  protected toggleOneClassFromList(toBeApplied: string, all: string[]) {
    const formatter = this.editor.formatter;
    all.filter((v) => v !== toBeApplied).forEach((v) => formatter.remove(v));
    formatter.toggle(toBeApplied);
    // Set dirty, because formatter.toggle doesn't do it
    this.editor.setDirty(true);
  }


  protected toggleAdam(usePortalRoot: boolean, showImagesOnly: boolean) {
    // Toggle Adam in the Dialog
    this.adam.toggle(usePortalRoot, showImagesOnly);

    // Switch to Dialog if we are still inline
    // TODO: VERIFY DIALOG ALLOWED once the option exits
    const currMode = this.options.configManager.current;
    const isDialog = currMode.displayMode === DialogModes.DisplayDialog;
    if (!isDialog)
      this.openInDialog();
  }

  /** Mode switching to inline/dialog and advanced/normal */
  protected switchMode(displayMode?: DialogModes.DisplayModes, editMode?: EditModes.WysiwygEditMode): void {
    const currMode = this.options.configManager.current;
    displayMode ??= currMode.displayMode;
    editMode ??= currMode.editMode;
    const newSettings = this.options.configManager.switch(editMode, displayMode);
    // don't create a new object, we must keep a reference to the previous parent `this.options`.
    // don't do this: this.options = {...this.options, ...newSettings};
    this.options.toolbar = newSettings.toolbar;
    this.options.menubar = newSettings.menubar;
    this.options.contextmenu = newSettings.contextmenu;
console.warn('2dm menubar', newSettings);
    // refresh editor toolbar
    this.editor.editorManager.remove(this.editor);
    this.editor.editorManager.init(this.options);
  }

  protected openInDialog() {
    // fixes bug where toolbar drawer is shown above full mode tinymce
    // todo: docs say that Drawer is being deprecated ? but I don't think this has to do with drawer?
    // https://www.tiny.cloud/docs/configure/editor-appearance/#toolbar_mode
    const toolbarDrawerOpen = this.editor.queryCommandState('ToggleToolbarDrawer');
    if (toolbarDrawerOpen) this.editor.execCommand('ToggleToolbarDrawer');

    // Open the Dialog
    this.field.connector.dialog.open(wysiwygEditorHtmlTag);
  }


  abstract register(): void;

  protected getButtons() {
    return this.editor.ui.registry.getAll().buttons;
  }

  /** Inner call for most onItemAction commands */
  protected runOrExecCommand(api: unknown, value: unknown) {
    // If it's a function, call it with params (the params are usually not used)
    if (typeof(value) === 'function') value(api, value);

    // If it's a string, it must be a command the editor knows
    if (typeof(value) === 'string') this.editor.execCommand(value);
  }

  protected toggleFormat(tag: string) {
    this.editor.execCommand('mceToggleFormat', false, tag);
  }


  /** Create a common default structure for most SplitButtonSpecs */
  protected splitButtonSpecs(initialCommand: string | FuncVoid) {
    return {
      onAction: (api: unknown) => {
        this.runOrExecCommand(api, initialCommand);
      },
      onItemAction: (api: unknown, value: unknown) => {
        this.runOrExecCommand(api, value);
      },
    };
  }

  /**
   * Compact way to create a SplitButtonChoiceItem
   * @param icon The icon
   * @param text The label
   * @param action In basic cases it's just a string - the name of the command, or the method
   */
  protected splitButtonItem(icon: string, text: string, action: string | FuncVoid) {
    return { icon, text, type: 'choiceitem' as 'choiceitem', value: action as string }; // pretend action is as string
  }

  protected splitButtonItemTipped(icon: string, text: string, tooltip: string, action: string | FuncVoid) {
    const sbi = this.splitButtonItem(icon, text, action);
    return { ...sbi, tooltip }; // pretend action is as string
  }

  protected regBtn(name: string, icon: string, tooltip: string, action: () => void) {
    this.editor.ui.registry.addButton(name, {
      icon,
      tooltip,
      onAction: action,
    });
  }

}
