import { wysiwygEditorHtmlTag } from '../../constants';
import { ToFullscreen } from '../public';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsDialog extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
      super(makerParams);
  }

  register(): void {
    this.registerOpenDialog();
  }

  /** Switch to Dialog Mode */
  // todo: docs say that Drawer is being deprecated ? but I don't think this has to do
  // with drawer?
  // https://www.tiny.cloud/docs/configure/editor-appearance/#toolbar_mode
  private registerOpenDialog(): void {
    this.editor.ui.registry.addButton(ToFullscreen, {
      icon: 'browse',
      tooltip: 'SwitchMode.Expand',
      onAction: (api) => {
        // this.openInDialog();
        // fixes bug where toolbar drawer is shown above full mode tinymce
        const toolbarDrawerOpen = this.editor.queryCommandState('ToggleToolbarDrawer');
        if (toolbarDrawerOpen) {
          this.editor.execCommand('ToggleToolbarDrawer');
        }
        this.field.connector.dialog.open(wysiwygEditorHtmlTag);
      },
    });
  }

  // protected openInDialog() {
  //   // fixes bug where toolbar drawer is shown above full mode tinymce
  //   const toolbarDrawerOpen = this.editor.queryCommandState('ToggleToolbarDrawer');
  //   if (toolbarDrawerOpen) {
  //     this.editor.execCommand('ToggleToolbarDrawer');
  //   }
  //   this.field.connector.dialog.open(wysiwygEditorHtmlTag);
  // }

}
