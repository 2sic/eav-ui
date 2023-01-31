import * as Buttons from '../../constants/buttons';
import * as EditModes from '../../constants/edit-modes';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsModes extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
    super(makerParams);
  }

  register(): void {
    this.addSwitchModeButtons();

    // experimental
    // this.addModes();
  }

  /** Switch normal / advanced mode */
  private addSwitchModeButtons(): void {
    this.regBtn(Buttons.ModeDefault, 'close', 'SwitchMode.Standard', () => {
      this.switchMode(null, EditModes.Default);
    });
    // this.editor.ui.registry.addButton(ToModeInline, {
    //   icon: 'close',
    //   tooltip: 'SwitchMode.Standard',
    //   onAction: (api) => { this.switchModeNew(WysiwygDefault, WysiwygInline); },
    // });
    this.regBtn(Buttons.ModeAdvanced, 'custom-school', 'SwitchMode.Pro', () => {
      this.switchMode(null, EditModes.WysiwygAdvanced);
    });
  }


  // // - i18n
  // // - icons
  // // - finalize toolbars
  // // - see if we can right-align the last toolbar part
  // private addModes(): void {
  //   this.regBtn(ToolbarModeToggle, 'settings', 'SwitchMode.Tooltip',
  //     () => { this.cycleMode(); });

  //   this.editor.ui.registry.addSplitButton(ToolbarModes, {
  //     ...this.splitButtonSpecs(() => this.cycleMode()),
  //     icon: 'settings',
  //     tooltip: 'SwitchMode.Tooltip',
  //     fetch: (callback) => {
  //       callback([
  //         this.splitButtonItem('info', 'Default / Balanced', () => { this.cycleMode(WysiwygDefault); }),
  //         this.splitButtonItem('info', 'Writing Mode', () => { this.cycleMode(WysiwygModeText); }),
  //         this.splitButtonItem('info', 'Rich Media Mode', () => { this.cycleMode(WysiwygModeMedia); }),
  //       ]);
  //     }
  //   });
  // }

  // private cycleMode(newMode?: WysiwygEditMode): void {

  //   console.log('2dm tiny', this.editor);
  //   console.log('2dm tiny editorContainer', this.editor.editorContainer);

  //   // const ec = this.editor.editorContainer;
  //   const ec = this.editor.getContainer();
  //   console.log('2dm 1', ec.getElementsByClassName('tox-toolbar'));
  //   console.log('2dm 2', ec.querySelector('.tox-toolbar'));

  //   return;

  //   if (!newMode) {
  //     const current = this.options.currentMode.editMode;
  //     const idx = WysiwygModeCycle.indexOf(current) + 1; // will be a number or 0 afterwards
  //     newMode = (idx < WysiwygModeCycle.length)
  //       ? WysiwygModeCycle[idx]
  //       : WysiwygModeCycle[0];

  //   }
  //   this.switchMode(null, newMode);
  // }
  // export const WysiwygModeCycle: WysiwygEditMode[] = [
  //   WysiwygDefault,
  //   WysiwygModeText,
  //   WysiwygModeMedia
  // ];
}
