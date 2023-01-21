// tslint:disable-next-line: max-line-length
import { expandSet, NoButtons, ButtonSetSelector, NewRow } from './button-set-helpers';
import { AddContentBlock, AddContentSplit, ContentDivision, HGroups, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, ToFullscreen, ToolbarModeToggle } from './public';
import { TinyEavConfig, SelectSettings } from './tinymce-config';
// tslint:disable-next-line: max-line-length
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygAdvanced, WysiwygDefault, WysiwygDialog, WysiwygInline, WysiwygMode, WysiwygView } from './tinymce-helper-types';

// #region Button Sets that define what buttons appear in what view / mode

const DefaultToolbars = expandSet({
  all: {
    // #v1500-not-ready
    // default: ` ${ToolbarModeToggle} undo redo pastetext`,
    // advanced: ` ${ToolbarModeToggle} undo pastetext`,
    default: [
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `bold ${ItalicWithMore}`,
      /* paragraph types  */ `h2 ${HGroups.h3}`,
      /* bullets          */ `numlist ${ListGroup}`,
      /* links/media      */ `${LinkGroup}`,
      /* rich media       */ NoButtons,
      /* content block    */ AddContentBlock,
      /* tools/mode switch*/ `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`,
      /* Experiment. split*/ NewRow,
      /* Experiment. split*/ `undo`
    ],
    advanced: [
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `styles bold ${ItalicWithMore}`,
      /* paragraph types  */ `h2 ${HGroups.h3}`,
      /* bullets          */ `numlist ${ListGroup}`,
      /* links/media      */ `${LinkGroupPro}`, // test
      /* rich media       */ NoButtons,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`,
    ],
    text: [
      /* initial w/undo   */ `${ToolbarModeToggle} undo redo pastetext paste removeformat`,
      /* format text      */ `bold ${ItalicWithMore}`,
      /* paragraph types  */ `h2 h3 ${HGroups.h4}`,
      /* bullets          */ 'numlist bullist outdent indent',
      /* links/media      */ `${LinkGroup}`,
      /* rich media       */ NoButtons,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`,
    ],
    media: [
      /* initial w/undo   */ `${ToolbarModeToggle} undo pastimage-todo`,  // TODO: create pasteimage
      /* format text      */ NoButtons,
      /* paragraph types  */ NoButtons,
      /* bullets          */ NoButtons,
      /* links/media      */ `${SxcImages} ${LinkFiles}`,
      /* rich media       */ `${ContentDivision} ${AddContentSplit}`,
      /* content block    */ AddContentBlock,
      /* tools/mode switch*/ `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`,
    ],
  },
  dialog: {
    default: [
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `bold ${ItalicWithMore}`,
      /* paragraph types  */ `h2 ${HGroups.h3}`,
      /* bullets          */ `numlist ${ListGroup}`,
      /* links/media      */ `${SxcImages} ${LinkGroupPro}`, // different from other default
      /* rich media       */ NoButtons,
      /* content block    */ AddContentBlock,
      /* tools/mode switch*/ `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`,
    ],
  }
});


const ButtonSetContextMenu = expandSet({
  all: {
    default: 'charmap hr',
    // advanced: 'charmap hr',
    text: 'charmap hr | link',
    media: 'charmap hr | link image'
  }
});

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
    const selector = new ButtonSetSelector({ mode, view, buttons: config, features: this.config.features });
    const selectorContextWip = new ButtonSetSelector({ mode: WysiwygAdvanced, view, buttons: config, features: this.config.features });
    return {
      currentMode: {
        view,
        mode,
      },
      menubar: mode === WysiwygAdvanced,
      toolbar: this.toolbar(selector),
      contextmenu: selectorContextWip.select(ButtonSetContextMenu)
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : ''),
    };
  }

  private toolbar(selector: ButtonSetSelector): string[] {
    const list = selector.select(DefaultToolbars).flat();

    const toolbarRows = list.reduce((acc, cur) => {
      if (cur === NewRow)
        acc.push([]);
      else
        acc[acc.length - 1].push(cur);
      return acc;
    }, [new Array<string>()]);

    return this.cleanUpDisabledButtons(selector.settings,
      toolbarRows.map(t => t.join(' | '))
    );
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
