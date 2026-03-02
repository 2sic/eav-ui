import * as Buttons from '../constants/buttons';
import * as EditModes from '../constants/edit-modes';
import * as Rich from '../constants/rich-wysiwyg';
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

    const cleaned = this.#removeDisabledButtons(wysiwygConfiguration, rows.map(t => t.join(' | ')));
    return cleaned;
  }

  #removeDisabledButtons(config: WysiwygConfiguration, toolbar: string[]): string[] {
    // make sure each button is separated by a space, so we can easily remove it
    toolbar = toolbar.map(t => ` ${t.replace(/\|/g, ' | ')} `);
    const removeMap = this.#createRemoveMap(config);
    return toolbar.map(row =>
      removeMap.reduce((t, rmvRule) => !rmvRule.enabled && t.indexOf(` ${rmvRule.button} `) > -1
        ? t.replace(rmvRule.button, '')
        : t
      , row)
    );
  }

  /**
   * Create list/map of buttons and whether they are enabled or not, so we can easily remove them from the toolbar if needed.
   * @returns the map which will later be processed to remove disabled buttons from the toolbar configuration
   */
  #createRemoveMap(config: WysiwygConfiguration): { button: string, enabled: boolean }[] {
    const editModeAdvanced = config.editMode === EditModes.WysiwygAdvanced;
    const map = [
      { button: Buttons.Code, enabled: config.buttons.source },
      { button: Buttons.DialogOpen, enabled: config.buttons.dialog && config.features.editInDialog },
      { button: Buttons.ModeAdvanced, enabled: config.buttons.advanced && !editModeAdvanced },
      { button: Buttons.ModeDefault, enabled: editModeAdvanced },
      { button: Buttons.AddContentBlock, enabled: config.features.contentBlocks },
    ];

    // Add rules for all spacers / splitter buttons
    const splitters = Rich.ContentSplitters.map(cs => ({
      button: cs.name,
      enabled: config.features.contentSplitters,
    }));

    return [...map, ...splitters];
  }
}
