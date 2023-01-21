import { Adam } from 'projects/edit-types';
import { Editor } from 'tinymce';
import { FieldStringWysiwygEditor } from '../../editor/editor';
import { RawEditorOptionsWithModes } from '../tinymce-helper-types';

type FuncVoid = () => void | unknown;

/** Helper to ensure add-to-registry params don't always change on every implementing class */
export interface AddToRegistryParams {
  field: FieldStringWysiwygEditor;
  editor: Editor;
  adam: Adam;
  options: RawEditorOptionsWithModes;
}

/**
 * Base class for tools which add buttons to tinymce
 * Important to split code a bit
 */
export abstract class AddToRegistryBase {

  field: FieldStringWysiwygEditor;
  editor: Editor;
  adam: Adam;
  options: RawEditorOptionsWithModes;

  constructor(makerParams: AddToRegistryParams) {
      this.field = makerParams.field;
      this.editor = makerParams.editor;
      this.adam = makerParams.adam;
      this.options = makerParams.options;
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

  // TODO: @SDV pls change wherever possible to use this as it's quite a bit shorter
  protected regBtn(name: string, icon: string, tooltip: string, action: () => void) {
    this.editor.ui.registry.addButton(name, {
      icon,
      tooltip,
      onAction: action,
    });
  }

}
