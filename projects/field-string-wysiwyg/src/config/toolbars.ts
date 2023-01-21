// tslint:disable-next-line: max-line-length
import { select } from '@ngrx/store';
import { expandSet, expandSetByView, NoButtons, ButtonSetSelector } from './button-set-helpers';
import { AddContentBlock, AddContentSplit, ContentDivision, HGroups, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, ToFullscreen, ToolbarModeToggle } from './public';
import { TinyEavButtons, TinyEavConfig, SelectSettings } from './tinymce-config';
// tslint:disable-next-line: max-line-length
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygAdvanced, WysiwygDefault, WysiwygDialog, WysiwygInline, WysiwygMode, WysiwygView } from './tinymce-helper-types';

// #region Button Sets that define what buttons appear in what view / mode

const BSet1Intro = expandSet({
  // #v1500-not-ready
  // default: ` ${ToolbarModeToggle} undo redo pastetext`,
  // advanced: ` ${ToolbarModeToggle} undo pastetext`,
  default: `  undo redo pastetext paste removeformat`,
  // advanced: ` undo redo pastetext paste removeformat`,
  text: `${ToolbarModeToggle} undo redo pastetext paste removeformat`,
  media: `${ToolbarModeToggle} undo pastimage-todo `  // TODO: create pasteimage
});

const BSet2Format = expandSet({
  default: `bold ${ItalicWithMore}`,
  advanced: `styles bold ${ItalicWithMore}`,
  text: `bold ${ItalicWithMore}`,
  media: NoButtons,
});

const BSet3Headings = expandSet({
  default: `h2 ${HGroups.h3}`,
  // advanced: `h2 ${HGroups.h3}`,
  text: `h2 h3 ${HGroups.h4}`,
  media: NoButtons,
});

const BSet4NumList = expandSet({
  default: `numlist ${ListGroup}`,
  // advanced: `numlist ${ListGroup}`,
  text: 'numlist bullist outdent indent',
  media: NoButtons
});

const BSet5Links = expandSetByView({
  default: {
    default: `${LinkGroup}`,
    advanced: `${LinkGroupPro}`, // test
    // text: `${LinkGroup}`,
    media: `${SxcImages} ${LinkFiles}`,
  },
  dialog: {
    default: `${SxcImages} ${LinkGroupPro}`,
    advanced: `${SxcImages} ${LinkGroupPro}`,
  }
});

const BSet6RichMedia = expandSet({
  default: false,
  advanced: false,
  text: false,
  media: true,
});

const BSet7ContentBlocks = expandSet({
  default: true,
  advanced: false,
  text: false,
  media: true,
});

const BSet9ToolsAndDialog = expandSet({
  default: settings => [
    'code',
    ModeAdvanced,
    ToFullscreen,
  ].join(' '),
  advanced: settings => [
    'code',
    ModeDefault,
    ToFullscreen,
  ].join(' '),
});


const ButtonSetContextMenu = expandSet({
  default: 'charmap hr',
  // advanced: 'charmap hr',
  text: 'charmap hr | link',
  media: 'charmap hr | link image'
});

// #endregion

export class TinyMceToolbars implements ToolbarSwitcher {

  constructor(private config: TinyEavConfig) {
  }

  public build(isInline: boolean): TinyMceModeWithSwitcher {
// console.log('2dm inline', isInline);
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
      toolbar: this.toolbar(mode, view, config),
      contextmenu: selectorContextWip.select(ButtonSetContextMenu)
        + (this.config.features.contentBlocks ? ` ${AddContentBlock} ` : ''),
    };
  }

  private toolbar(mode: WysiwygMode, view: WysiwygView, config: TinyEavButtons): string[] {
// console.log('2dm advanced', config.advanced, config, mode);
    var selector = new ButtonSetSelector({ mode, view, buttons: config, features: this.config.features });
    const list = [
      selector.select(BSet1Intro),
      selector.select(BSet2Format),
      selector.select(BSet3Headings),
      selector.select(BSet4NumList),
      selector.select(BSet5Links),
      (selector.select(BSet6RichMedia) ? this.richContent() : null),
      (selector.select(BSet7ContentBlocks) ? this.contentBlocks() : null),
      selector.select(BSet9ToolsAndDialog),
    ];
    return this.cleanUpDisabledButtons(selector.settings, [ list.join(' | '), list.join(' | ') ]);
  }

  private cleanUpDisabledButtons(settings: SelectSettings, toolbar: string[]): string[] {
    return toolbar.map(t => {
      t = this.removeButtonIfNotEnabled(t, 'code', settings.buttons.source);
      t = this.removeButtonIfNotEnabled(t, ToFullscreen, settings.buttons.dialog);
      t = this.removeButtonIfNotEnabled(t, 'advanced', settings.buttons.advanced);
      t = this.removeButtonIfNotEnabled(t, 'AddContentBlock', settings.features.contentBlocks);
      return t;
    });
  }

  private removeButtonIfNotEnabled(toolbar: string, button: string, enabled: boolean): string {
    // console.log('2dm button remove', button, enabled, toolbar);
    return (toolbar.indexOf(` ${button} `) > -1 && !enabled)
      ? toolbar.replace(button, '')
      : toolbar;
  }

  private richContent(): string {
    return this.config.features.wysiwygEnhanced ? `${ContentDivision} ${AddContentSplit}` : null;
  }

  private contentBlocks(): string {
    return this.config.features.contentBlocks ? AddContentBlock : null;
  }
}
