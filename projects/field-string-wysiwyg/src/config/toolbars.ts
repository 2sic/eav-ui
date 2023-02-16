import { consoleLogWebpack } from '../../../field-custom-gps/src/shared/console-log-webpack.helper';
import * as Buttons from '../constants/buttons';
import * as DialogModes from '../constants/display-modes';
import * as EditModes from '../constants/edit-modes';
import { ButtonGroupSelector } from './button-group-selector';
import { NewRow, toButtonGroupByView } from './button-groups';
import { DefaultContextMenu, DefaultToolbarConfig } from './defaults';
import { SelectSettings, TinyEavConfig } from './tinymce-config';
import { TinyMceMode } from './tinymce-helper-types';

// #region Button Sets that define what buttons appear in what view / mode


const toolbarConfig = toButtonGroupByView(DefaultToolbarConfig);


const ButtonSetContextMenu = toButtonGroupByView(DefaultContextMenu);

// #endregion

export class TinyMceToolbars { // } implements ToolbarSwitcher {

  constructor(private config: TinyEavConfig) {
  }

  public build(isInline: boolean): TinyMceMode {
    const displayMode = isInline ? DialogModes.DisplayInline : DialogModes.DisplayDialog;
    const initial = this.switch(displayMode, this.config.mode?.[displayMode] || EditModes.Default);
    return {
      // modeSwitcher: this,
      ...initial
    };
  }

  public switch(displayMode: DialogModes.DisplayModes, editMode: EditModes.WysiwygEditMode): TinyMceMode {
    consoleLogWebpack(`TinyMceToolbars.switch(${displayMode}, ${editMode})`, this.config);
    const buttons = this.config.buttons[displayMode];
    const selector = new ButtonGroupSelector({ editMode, displayMode, buttons, features: this.config.features });
    return {
      currentMode: {
        displayMode,
        editMode,
      },
      menubar: editMode === EditModes.WysiwygAdvanced,
      toolbar: this.toolbar(selector) as any,
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

    const cleaned = this.cleanUpDisabledButtons(selector.settings, rows.map(t => t.join(' | ')));
    return cleaned;
  }

  private cleanUpDisabledButtons(settings: SelectSettings, toolbar: string[]): string[] {
    // make sure each button is separated by a space, so we can easily remove it
    toolbar = toolbar.map(t => ` ${t.replace(/\|/g, ' | ')} `);
    const removeMap = this.createRemoveMap(settings);
    return toolbar.map(row =>
      removeMap.reduce((t, rmvRule) => !rmvRule.enabled && t.indexOf(` ${rmvRule.button} `) > -1
        ? t.replace(rmvRule.button, '')
        : t
      , row)
    );
  }

  private createRemoveMap(settings: SelectSettings): { button: string, enabled: boolean }[] {
    const map = [
      { button: Buttons.Code, enabled: settings.buttons.source },
      { button: Buttons.DialogOpen, enabled: settings.buttons.dialog },
      { button: Buttons.ModeAdvanced, enabled: settings.buttons.advanced },
      { button: Buttons.ModeDefault, enabled: settings.editMode === EditModes.WysiwygAdvanced },
      { button: Buttons.AddContentBlock, enabled: settings.features.contentBlocks },
      { button: Buttons.XXXContentDivision, enabled: false /* settings.features.contentSeparators */ },
      { button: Buttons.ContentSectionSplitter, enabled: settings.features.contentSeparators },
    ];
    console.log('2dm remove map', map);
    return map;
  }
}
