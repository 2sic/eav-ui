import { ButtonGroupByViewRaw, NewRow, NoButtons } from '../button-groups';
import { ItalicWithMore, HGroups, ListGroup, LinkGroup, AddContentBlock, ModeAdvanced, ModeDefault, ToFullscreen, LinkGroupPro, ToolbarModeToggle, SxcImages, LinkFiles, ContentDivision, AddContentSplit } from '../public';


export const DefaultToolbarConfig: ButtonGroupByViewRaw = {
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
      // /* Experiment. split*/ NewRow,
      // /* Experiment. split*/ `undo`
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
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `bold ${ItalicWithMore}`,
      /* paragraph types  */ `h2 h3 ${HGroups.h4}`,
      /* bullets          */ 'numlist bullist outdent indent',
      /* links/media      */ `${LinkGroup}`,
      /* rich media       */ NoButtons,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`,
    ],
    'text-light': [
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `bold italic`,
      /* paragraph types  */ NoButtons,
      /* bullets          */ NoButtons,
      /* links/media      */ `${LinkGroup}`,
      /* rich media       */ NoButtons,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`,
    ],
    media: [
      /* initial w/undo   */ `undo pasteimage-todo`,  // TODO: create pasteimage
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
};
