import { ButtonGroupByViewRaw, NewRow, NoButtons } from '../button-groups';
import { AddContentBlock, AddContentSplit, ContentDivision, HGroups, ItalicWithMore, LinkFiles, LinkGroup, LinkGroupPro,
   LinkPage, ListGroup, ModeAdvanced, ModeDefault, SxcImages, ToFullscreen } from '../public';

const finalLineWithCodeAndMore = `code ${ModeAdvanced} ${ModeDefault} ${ToFullscreen}`;

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
      /* tools/mode switch*/ finalLineWithCodeAndMore,
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
      /* tools/mode switch*/ finalLineWithCodeAndMore,
    ],
    text: [
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `bold ${ItalicWithMore}`,
      /* paragraph types  */ `h2 h3 ${HGroups.h4}`,
      /* bullets          */ 'numlist bullist outdent indent',
      /* links/media      */ `${LinkGroup}`,
      /* rich media       */ NoButtons,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ finalLineWithCodeAndMore,
    ],
    'text-minimal': [
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `bold italic`,
      /* paragraph types  */ NoButtons,
      /* bullets          */ NoButtons,
      /* links/media      */ `link ${LinkPage}`,
      /* rich media       */ NoButtons,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ finalLineWithCodeAndMore,
    ],
    'text-basic': [
      /* initial w/undo   */ `undo redo pastetext paste removeformat`,
      /* format text      */ `bold ${ItalicWithMore}`,
      /* paragraph types  */ NoButtons,
      /* bullets          */ 'numlist bullist outdent indent',
      /* links/media      */ `${LinkGroup}`,
      /* rich media       */ NoButtons,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ finalLineWithCodeAndMore,
    ],
    media: [
      /* initial w/undo   */ `undo pasteimage-todo`,  // TODO: create pasteimage
      /* format text      */ NoButtons,
      /* paragraph types  */ NoButtons,
      /* bullets          */ NoButtons,
      /* links/media      */ `${SxcImages} ${LinkFiles}`,
      /* rich media       */ `${ContentDivision} ${AddContentSplit}`,
      /* content block    */ AddContentBlock,
      /* tools/mode switch*/ finalLineWithCodeAndMore,
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
      /* tools/mode switch*/ finalLineWithCodeAndMore,
    ],
  }
};
