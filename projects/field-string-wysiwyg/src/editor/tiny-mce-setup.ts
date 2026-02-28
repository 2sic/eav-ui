import { Subscription } from 'rxjs';
import { Editor, EditorEvent } from 'tinymce';
import { classLog } from '../../../shared/logging';
import { RawEditorOptionsExtended } from '../config/raw-editor-options-extended';
import { AddEverythingToRegistry } from '../config/ui-registry/add-everything-to-registry';
import { AddToRegistryParams } from '../config/ui-registry/add-to-registry-base';
import { SwitchModeHelper } from '../config/ui-registry/switch-mode.helper';
import { attachAdam } from '../connector/adam';
import { WysiwygDialogModes } from '../constants';
import { FieldStringWysiwygEditor } from '../field-string-wysiwyg/field-string-wysiwyg-editor';
import { connectorToDisabled$ } from './editor-helpers';
import { EditorPasteOrDrop } from './editor-paste-or-drop';
import { EditorValueHelper } from './editor-value-helper';
import { EditorWithId } from './editor-with-id';
import { fixMenuPositions } from './fix-menu-positions.helper';

const logSpecs = {
  all: false,
  TinyMceInitialized: false,
};

export class TinyMceBuilder {
  log = classLog({ TinyMceBuilder }, logSpecs);

  // #editor: Editor;
  #subscriptions = new Subscription();
  #menuObserver: MutationObserver;
  #valueHelper: EditorValueHelper;
  #pasteHandler = new EditorPasteOrDrop();

  isKilled = false;

  /** This will initialized an instance of an editor. Everything else is kind of global. */
  onInit(parent: FieldStringWysiwygEditor, editor: Editor, rawEditorOptions: RawEditorOptionsExtended): void {

    // Capture Ctrl + Enter to prevent inserting a line break in the WYSIWYG editor 
    editor.on('keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter")
        event.preventDefault();
    });

    (editor as EditorWithId).idRandom = Math.random().toString(36).substring(2, 8);
    
    // Remember reference to destroy later
    // this.#editor = editor;

    this.#valueHelper = new EditorValueHelper(editor as EditorWithId);

    // On init, add everything to the registry so it can be used by buttons and other UI elements, and do other setup like setting up subscriptions
    editor.on('init', _ => {
      const l = this.log.fnIf('TinyMceInitialized', { editor });

      // If there is a reconfiguration, run the editorOnInit code now, so it can do things like add buttons before we add everything to the registry
      parent.reconfigure?.editorOnInit?.(editor);

      const addToRegistryParams = {
        field: parent,
        editor,
        adam: parent.connector._experimental.adam,
        options: rawEditorOptions,
      } satisfies AddToRegistryParams;

      new AddEverythingToRegistry(addToRegistryParams).register();

      const isDebug = parent.connector._experimental.isDebug();
      parent.connector._experimental.debugWatch(isNewDebug => {
        // The first case must be skipped, as the editor is not ready yet, and the callback is triggered automatically.
        if (isDebug == isNewDebug)
          return;
        console.warn(`Debug mode changed:`, { isDebug });
        new SwitchModeHelper(addToRegistryParams).switchMode(null, null);
      });



      if (!parent.reconfigure?.disableAdam)
        attachAdam(editor, parent.connector._experimental.adam);

      this.#menuObserver = fixMenuPositions(parent);

      // Shared subscriptions
      this.#subscriptions.add(
        parent.connector.data.value$.subscribe(newValue => {
          this.#valueHelper.handleExternalValueUpdate(newValue);
        })
      );

      this.#subscriptions.add(
        connectorToDisabled$(parent.connector).subscribe(disabled => {
          this.log.a(`Field config disabled`, { disabled, mode: editor.mode.get() });
          parent.classList.toggle('disabled', disabled);
          editor.mode.set(disabled ? 'readonly' : 'design');
        }),
      );

      this.onInitSetupDelayFocus(parent, editor);

      parent.firstInit = false;
    });

    // on change, undo and redo, save/push the value
    ['change', 'undo', 'redo', 'input'].forEach(name => editor.on(name, () => this.#valueHelper.saveValue(parent.connector)));

    // Setup focus/blur handling
    this.watchFocusEvents(parent, editor);

    // Setup paste and drop handling
    this.#pasteHandler.tinyMceSetup(editor, parent.connector, rawEditorOptions);

    // called after TinyMCE editor is removed
    // this should be here, as it's responsibility is on this class
    editor.on('remove', _event => {
      this.log.a(`TinyMCE removed`, _event);
      this.cleanup();
    });

    // if the system has a reconfigure object, run it's code now
    parent.reconfigure?.configureEditor?.(editor);
  }

  onInitSetupDelayFocus(parent: FieldStringWysiwygEditor, editor: Editor): void {
    const delayFocus = () => setTimeout(() => editor.focus(false), 100);

    // If not inline mode always focus on init
    if (parent.mode !== WysiwygDialogModes.DisplayInline)
      delayFocus();
    else {
      // If is inline mode skip focus on first init
      if (!parent.firstInit)
        delayFocus()

      // Inline only subscriptions
      this.#subscriptions.add(parent.connector._experimental.isExpanded$.subscribe(isExpanded => {
        parent.dialogIsOpen = isExpanded;

        if (!parent.firstInit && !parent.dialogIsOpen)
          delayFocus();
      }));
    }
  }

  watchFocusEvents(parent: FieldStringWysiwygEditor, editor: Editor): void {
    // Define the function
    const handleFocus = (focused: boolean, _event: EditorEvent<unknown>) => {
      parent.classList.toggle('focused', focused);
      this.log.a(`TinyMCE focused ${focused}`, _event);
      if (parent.mode === 'inline')
        parent.connector._experimental.setFocused(focused);
    };

    // attach to editor events
    editor.on('focus', _event => {
      handleFocus(true, _event);
      if (!parent.reconfigure?.disableAdam)
        attachAdam(editor, parent.connector._experimental.adam);
    });

    editor.on('blur', _event => handleFocus(false, _event));
  }


  
  cleanup(): void {
    this.#subscriptions.unsubscribe();
    // this.#editor?.destroy();
    // this.#editor?.remove();
    this.#valueHelper = null;
    this.#pasteHandler = null;
    this.#menuObserver?.disconnect();
    this.#menuObserver = null;
    this.isKilled = true;
  }
}