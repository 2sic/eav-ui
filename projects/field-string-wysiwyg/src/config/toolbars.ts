// tslint:disable-next-line: max-line-length
import { ButtonGroupSelector } from './button-group-selector';
import { toButtonGroupByView, NewRow } from './button-groups';
import { DefaultContextMenu, DefaultToolbarConfig } from './defaults';
import { AddContentBlock, AddContentSplit, ContentDivision, ModeAdvanced, ModeDefault, ToFullscreen } from './public';
import { TinyEavConfig, SelectSettings } from './tinymce-config';
// tslint:disable-next-line: max-line-length
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygAdvanced, WysiwygDefault, WysiwygDialog, WysiwygInline, WysiwygMode, WysiwygView } from './tinymce-helper-types';

// #region Button Sets that define what buttons appear in what view / mode


const toolbarConfig = toButtonGroupByView(DefaultToolbarConfig);


const ButtonSetContextMenu = toButtonGroupByView(DefaultContextMenu);

// #endregion

export class TinyMceToolbars implements ToolbarSwitcher {

  constructor(private config: TinyEavConfig) {
  }

  public build(isInline: boolean): TinyMceModeWithSwitcher {
    const initial = this.switch(isInline ? WysiwygInline : WysiwygDialog, WysiwygDefault);
    return {
      modeSwitcher: this,
      ...initial
    };
  }

  public switch(view: WysiwygView, mode: WysiwygMode): TinyMceMode {
    const config = this.config.buttons[view];
    const selector = new ButtonGroupSelector({ mode, view, buttons: config, features: this.config.features });
    return {
      currentMode: {
        view,
        mode,
      },
      menubar: mode === WysiwygAdvanced,
      toolbar: this.toolbar(selector),
      contextmenu: selector.select(ButtonSetContextMenu)[0],
    };
  }

  private toolbar(selector: ButtonGroupSelector): string[] {
    const allButtonGroups = selector.select(toolbarConfig).flat();
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
    return toolbar.map(toolbar =>
      removeMap.reduce((t, rm) => (t.indexOf(` ${rm.button} `) > -1 && !rm.enabled)
        ? t.replace(rm.button, '')
        : t
      , toolbar)
    );
  }

  private createRemoveMap(settings: SelectSettings): { button: string, enabled: boolean }[] {
    return [
      { button: 'code', enabled: settings.buttons.source },
      { button: ToFullscreen, enabled: settings.buttons.dialog },
      { button: ModeAdvanced, enabled: settings.buttons.advanced },
      { button: ModeDefault, enabled: !settings.buttons.advanced },
      { button: AddContentBlock, enabled: settings.features.contentBlocks },
      { button: ContentDivision, enabled: settings.features.wysiwygEnhanced },
      { button: AddContentSplit, enabled: settings.features.wysiwygEnhanced },
    ];
  }
}
