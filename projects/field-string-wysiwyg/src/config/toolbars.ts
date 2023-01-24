// tslint:disable-next-line: max-line-length
import { ButtonGroupSelector } from './button-group-selector';
import { NewRow, toButtonGroupByView } from './button-groups';
import { DefaultContextMenu, DefaultToolbarConfig } from './defaults';
import { AddContentBlock, AddContentSplit, ContentDivision, ModeAdvanced, ModeDefault, ToFullscreen } from './public';
import { SelectSettings, TinyEavConfig } from './tinymce-config';
// tslint:disable-next-line: max-line-length
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygAdvanced, WysiwygDefault, WysiwygDialog, WysiwygDisplayMode, WysiwygEditMode, WysiwygInline } from './tinymce-helper-types';

// #region Button Sets that define what buttons appear in what view / mode


const toolbarConfig = toButtonGroupByView(DefaultToolbarConfig);


const ButtonSetContextMenu = toButtonGroupByView(DefaultContextMenu);

// #endregion

export class TinyMceToolbars implements ToolbarSwitcher {

  constructor(private config: TinyEavConfig) {
  }

  public build(isInline: boolean): TinyMceModeWithSwitcher {
    const displayMode = isInline ? WysiwygInline : WysiwygDialog;
    const initial = this.switch(displayMode, this.config.mode?.[displayMode] || WysiwygDefault);
    return {
      modeSwitcher: this,
      ...initial
    };
  }

  public switch(displayMode: WysiwygDisplayMode, mode: WysiwygEditMode): TinyMceMode {
    const buttons = this.config.buttons[displayMode];
    const selector = new ButtonGroupSelector({ editMode: mode, displayMode, buttons, features: this.config.features });
    return {
      currentMode: {
        view: displayMode,
        mode,
      },
      menubar: mode === WysiwygAdvanced,
      toolbar: this.toolbar(selector),
      contextmenu: selector.selectButtonGroup(ButtonSetContextMenu)[0],
    };
  }

  private toolbar(selector: ButtonGroupSelector): string[] {
    const allButtonGroups = selector.selectButtonGroup(toolbarConfig).flat();
    const rows = allButtonGroups.reduce((acc, cur) => {
      if (cur === NewRow)
        acc.push([]);
      else
        acc[acc.length - 1].push(cur);
      return acc;
    }, [new Array<string>()]);

    return this.cleanUpDisabledButtons(selector.settings, rows.map(t => t.join(' | ')));
  }

  private cleanUpDisabledButtons(settings: SelectSettings, toolbar: string[]): string[] {
    // make sure each button is separated by a space, so we can easily remove it
    toolbar = toolbar.map(t => ` ${t.replace(/\|/g, ' | ')} `);
    const removeMap = this.createRemoveMap(settings);
    return toolbar.map(row =>
      removeMap.reduce((t, rm) => (t.indexOf(` ${rm.button} `) > -1 && !rm.enabled)
        ? t.replace(rm.button, '')
        : t
      , row)
    );
  }

  private createRemoveMap(settings: SelectSettings): { button: string, enabled: boolean }[] {
    const map = [
      { button: 'code', enabled: settings.buttons.source },
      { button: ToFullscreen, enabled: settings.buttons.dialog },
      { button: ModeAdvanced, enabled: settings.buttons.advanced },
      { button: ModeDefault, enabled: settings.editMode === WysiwygAdvanced },
      { button: AddContentBlock, enabled: settings.features.contentBlocks },
      { button: ContentDivision, enabled: settings.features.wysiwygEnhanced },
      { button: AddContentSplit, enabled: settings.features.wysiwygEnhanced },
    ];
    console.log('2dm remove map', map);
    return map;
  }
}
