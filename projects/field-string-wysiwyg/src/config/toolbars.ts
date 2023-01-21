// tslint:disable-next-line: max-line-length
import { expandSet, expandSetByView, NoButtons, ButtonSetSelector } from './button-set-helpers';
import { AddContentBlock, AddContentSplit, ContentDivision, HGroups, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro, ListGroup, ModeAdvanced, ModeDefault, SxcImages, ToFullscreen, ToolbarModeToggle } from './public';
import { TinyEavConfig, SelectSettings } from './tinymce-config';
// tslint:disable-next-line: max-line-length
import { TinyMceMode, TinyMceModeWithSwitcher, ToolbarSwitcher, WysiwygAdvanced, WysiwygDefault, WysiwygDialog, WysiwygInline, WysiwygMode, WysiwygView } from './tinymce-helper-types';

// #region Button Sets that define what buttons appear in what view / mode

// WIP Notes
const finalStruture = {
  inline: {
    default: ['undo redo pastetext paste removeformat bold italic h2 h3 h4 numlist bullist outdent indent link image'],
    advanced: ['undo redo pastetext paste removeformat bold italic h2 h3 h4 numlist bullist outdent indent link image', 'styles'],
    text: ['undo redo pastetext paste removeformat bold italic h2 h3 h4 numlist bullist outdent indent link image'],
  },
  dialog: {
    default: ['undo redo pastetext paste removeformat bold italic h2 h3 h4 numlist bullist outdent indent link image'],
    advanced: ['undo redo pastetext paste removeformat bold italic h2 h3 h4 numlist bullist outdent indent link image', 'styles'],
    text: ['undo redo pastetext paste removeformat bold italic h2 h3 h4 numlist bullist outdent indent link image'],
  },
};

const DefaultToolbars = [
  [
    // Set #1 with undo/redo etc.
    expandSet({
      // #v1500-not-ready
      // default: ` ${ToolbarModeToggle} undo redo pastetext`,
      // advanced: ` ${ToolbarModeToggle} undo pastetext`,
      default: `  undo redo pastetext paste removeformat`,
      // advanced: ` undo redo pastetext paste removeformat`,
      text: `${ToolbarModeToggle} undo redo pastetext paste removeformat`,
      media: `${ToolbarModeToggle} undo pastimage-todo `  // TODO: create pasteimage
    }),
    // Set #2 with bold/italic etc.
    expandSet({
      default: `bold ${ItalicWithMore}`,
      advanced: `styles bold ${ItalicWithMore}`,
      text: `bold ${ItalicWithMore}`,
      media: NoButtons,
    }),
    // Set #3 with h2/h3 etc.
    expandSet({
      default: `h2 ${HGroups.h3}`,
      // advanced: `h2 ${HGroups.h3}`,
      text: `h2 h3 ${HGroups.h4}`,
      media: NoButtons,
    }),
    // Set #4 with numlist/bullist etc.
    expandSet({
      default: `numlist ${ListGroup}`,
      // advanced: `numlist ${ListGroup}`,
      text: 'numlist bullist outdent indent',
      media: NoButtons
    }),
    // Set #5 with link/files etc.
    expandSetByView({
      default: {
        default: `${LinkGroup}`,
        advanced: `${LinkGroupPro}`, // test
        // text: `${LinkGroup}`,
        media: `${SxcImages} ${LinkFiles}`,
      },
      dialog: {
        default: `${SxcImages} ${LinkGroupPro}`,
        // advanced: `${SxcImages} ${LinkGroupPro}`,
      }
    }),
    // Set #6 with add-content etc.
    expandSet({
      default: NoButtons,
      media: `${ContentDivision} ${AddContentSplit}`,
    }),
    // Set #7 with add-content-block etc.
    expandSet({
      default: AddContentBlock,
      advanced: NoButtons,
      text: NoButtons,
      media: NoButtons,
    }),
    // Set #9 with code/advanced etc.
    expandSet({
      default: `code ${ModeAdvanced} ${ToFullscreen}`,
      advanced: `code ${ModeDefault} ${ToFullscreen}`,
    }),
  ],
  [
    expandSetByView(
      {
        inline: {
          default: `h2 ${HGroups.h3}`,
        }
      }
    )
  ]
];


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
    const list = DefaultToolbars
      .map(row => row.map(set => selector.select(set)));
    // const maxLength = list.reduce((a, b) => Math.max(a, b.length), 0);
    // const allToolbars = list.reduce((prevArr: string[], currSet) => 
    //   {
    //     currSet.forEach((bval: string, i: number) => prevArr[i] += bval);
    //     return prevArr;
    //   }, Array(maxLength).fill(''));
    // console.log('2dm, list', list);
    return this.cleanUpDisabledButtons(selector.settings,
      // allToolbars.map(t => t.trim())
      list.map(t => t.join(' | '))
    // [
    //   list.join(' | '),
    //   list.join(' | ')
    // ]
    );
  }

  private cleanUpDisabledButtons(settings: SelectSettings, toolbar: string[]): string[] {
    const removeMap = [
      { button: 'code', enabled: settings.buttons.source },
      { button: ToFullscreen, enabled: settings.buttons.dialog },
      { button: ModeAdvanced, enabled: settings.buttons.advanced },
      { button: AddContentBlock, enabled: settings.features.contentBlocks },
      { button: ContentDivision, enabled: settings.features.wysiwygEnhanced },
      { button: AddContentSplit, enabled: settings.features.wysiwygEnhanced },
    ];
    return toolbar.map(toolbar =>
      removeMap.reduce((t, rm) => (t.indexOf(` ${rm.button} `) > -1 && !rm.enabled)
        ? t.replace(rm.button, '')
        : t
      , toolbar)
    );
  }
}
