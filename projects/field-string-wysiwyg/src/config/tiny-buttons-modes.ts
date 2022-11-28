import { ModeDefault, ModeAdvanced, ToolbarModeToggle, ToolbarModes } from './public';
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';
import { WysiwygDefault, WysiwygAdvanced, WysiwygModeText, WysiwygModeMedia, WysiwygMode, WysiwygModeCycle, WysiwygView } from './tinymce-helper-types';

export class TinyButtonsModes extends TinyButtonsBase {
  constructor(makerParams: ButtonsMakerParams) {
      super(makerParams);
  }

  register(): void {
    this.addSwitchModeButtons();

    // experimental
    this.addModes();
  }

  /** Switch normal / advanced mode */
  private addSwitchModeButtons(): void {
    this.editor.ui.registry.addButton(ModeDefault, {
      icon: 'close',
      tooltip: 'SwitchMode.Standard',
      onAction: (api) => { this.switchMode(WysiwygDefault); },
    });
    // this.editor.ui.registry.addButton(ToModeInline, {
    //   icon: 'close',
    //   tooltip: 'SwitchMode.Standard',
    //   onAction: (api) => { this.switchModeNew(WysiwygDefault, WysiwygInline); },
    // });
    this.editor.ui.registry.addButton(ModeAdvanced, {
      icon: 'custom-school',
      tooltip: 'SwitchMode.Pro',
      onAction: (api) => { this.switchMode(WysiwygAdvanced); },
    });
  }


  // TODO: @2dm / @SDV
  // - i18n
  // - icons
  // - finalize toolbars
  // - see if we can right-align the last toolbar part
  private addModes(): void {
    this.regBtn(ToolbarModeToggle, 'settings', 'SwitchMode.Tooltip',
      () => { this.cycleMode(); });

    this.editor.ui.registry.addSplitButton(ToolbarModes, {
      ...this.splitButtonSpecs(() => this.cycleMode()),
      icon: 'settings',
      tooltip: 'SwitchMode.Tooltip',
      fetch: (callback) => {
        callback([
          this.splitButtonItem('info', 'Default / Balanced', () => { this.cycleMode(WysiwygDefault); }),
          this.splitButtonItem('info', 'Writing Mode', () => { this.cycleMode(WysiwygModeText); }),
          this.splitButtonItem('info', 'Rich Media Mode', () => { this.cycleMode(WysiwygModeMedia); }),
        ]);
      }
    });
  }

  private cycleMode(newMode?: WysiwygMode): void {
    if (!newMode) {
      const current = this.options.currentMode.mode;
      const idx = WysiwygModeCycle.indexOf(current) + 1; // will be a number or 0 afterwards
      newMode = (idx < WysiwygModeCycle.length)
        ? WysiwygModeCycle[idx]
        : WysiwygModeCycle[0];

    }
    this.switchMode(newMode);
  }






  /** Mode switching to inline/dialog and advanced/normal */
  private switchMode(mode: WysiwygMode, viewMode?: WysiwygView): void {
    viewMode ??= this.options.currentMode.view;
    const newSettings = this.options.modeSwitcher.switch(viewMode, mode);
    // don't create a new object, we must keep a refernec to the old
    // don't do this: this.options = {...this.options, ...newSettings};
    this.options.toolbar = newSettings.toolbar;
    this.options.menubar = newSettings.menubar;
    this.options.currentMode = newSettings.currentMode;
    this.options.contextmenu = newSettings.contextmenu;

    // refresh editor toolbar
    this.editor.editorManager.remove(this.editor);
    this.editor.editorManager.init(this.options);
  }
}
