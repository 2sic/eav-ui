import * as Buttons from '../constants/buttons';
import * as EditModes from '../constants/edit-modes';
import { WysiwygConfiguration } from './types/wysiwyg-configurations';

/**
 * Processes a toolbar configuration for eg.
 * 
 * - creates groups of of array items
 * - removes buttons that are disabled.
 */
export class ToolbarParser {

  public toolbar(wysiwygConfiguration: WysiwygConfiguration): string[] {
    const allButtonGroups = wysiwygConfiguration.toolbar;
    const rows = allButtonGroups.reduce((acc, cur) => {
      if (cur === Buttons.NewRow)
        acc.push([]);
      else
        acc[acc.length - 1].push(cur);
      return acc;
    }, [new Array<string>()]);

    const cleaned = this.cleanUpDisabledButtons(wysiwygConfiguration, rows.map(t => t.join(' | ')));
    return cleaned;
  }

  private cleanUpDisabledButtons(settings: WysiwygConfiguration, toolbar: string[]): string[] {
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

  private createRemoveMap(settings: WysiwygConfiguration): { button: string, enabled: boolean }[] {
    const editModeAdvanced = settings.editMode === EditModes.WysiwygAdvanced;
    const map = [
      { button: Buttons.Code, enabled: settings.buttons.source },
      { button: Buttons.DialogOpen, enabled: settings.buttons.dialog && settings.features.editInDialog },
      { button: Buttons.ModeAdvanced, enabled: settings.buttons.advanced && !editModeAdvanced },
      { button: Buttons.ModeDefault, enabled: editModeAdvanced },
      { button: Buttons.AddContentBlock, enabled: settings.features.contentBlocks },
      // { button: Buttons.XXXContentDivision, enabled: false /* settings.features.contentSeparators */ },
      { button: Buttons.ContentSectionSplitter, enabled: settings.features.contentSeparators },
    ];
    return map;
  }
}
