import * as Buttons from '../constants/buttons';
import * as EditModes from '../constants/edit-modes';
import { ButtonGroupSelector } from './button-group-selector';
import { NewRow, toButtonGroupByView } from './button-groups';
import { DefaultToolbarConfig } from './defaults';
import { SelectSettings } from './types/select-settings';
import { WysiwygConfiguration } from './types/wysiwyg-configurations';

// #region Button Sets that define what buttons appear in what view / mode


const toolbarConfig = toButtonGroupByView(DefaultToolbarConfig);


// #endregion

export class TinyMceToolbars {

  constructor() {
  }

  public switch(cnf: WysiwygConfiguration) {
    const selector = new ButtonGroupSelector({
      editMode: cnf.editMode,
      displayMode: cnf.displayMode,
      buttons: cnf.buttons,
      features: cnf.features });
    return this.toolbar(selector)
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
    const editModeAdvanced = settings.editMode === EditModes.WysiwygAdvanced;
    const map = [
      { button: Buttons.Code, enabled: settings.buttons.source },
      { button: Buttons.DialogOpen, enabled: settings.buttons.dialog },
      { button: Buttons.ModeAdvanced, enabled: settings.buttons.advanced && !editModeAdvanced },
      { button: Buttons.ModeDefault, enabled: editModeAdvanced },
      { button: Buttons.AddContentBlock, enabled: settings.features.contentBlocks },
      { button: Buttons.XXXContentDivision, enabled: false /* settings.features.contentSeparators */ },
      { button: Buttons.ContentSectionSplitter, enabled: settings.features.contentSeparators },
    ];
    return map;
  }
}
