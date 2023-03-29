import * as Buttons from '../../constants/buttons';
import { NewRow, NoButtons } from '../../constants/buttons';
import * as Rich from '../../constants/rich-wysiwyg';

const standardGroupUndoRedoPaste = `undo redo pastetext paste removeformat`;
const standardGroupFinal = `${Buttons.Code} ${Buttons.ModeAdvanced} ${Buttons.ModeDefault} ${Buttons.DialogOpen}`;

export const DefaultToolbarConfig = {
  default: [
    /* initial w/undo   */ standardGroupUndoRedoPaste,
    /* format text      */ `bold ${Buttons.StylesGroup}`,
    /* paragraph types  */ `h2 ${Buttons.HGroups.h3}`,
    /* bullets          */ `numlist ${Buttons.ListGroup}`,
    /* links/media      */ `${Buttons.LinkGroup}`,
    /* content block    */ Buttons.AddContentBlock,
    /* tools/mode switch*/ standardGroupFinal,
  ],
  advanced: [
    /* initial w/undo   */ standardGroupUndoRedoPaste,
    /* format text      */ `styles bold ${Buttons.StylesGroup}`,
    /* paragraph types  */ `h2 ${Buttons.HGroups.h3}`,
    /* bullets          */ `numlist ${Buttons.ListGroup}`,
    /* links/media      */ `${Buttons.LinkGroupWithAnchors}`, // test
    /* content block    */ NoButtons,
    /* tools/mode switch*/ standardGroupFinal,
  ],
  text: [
    /* initial w/undo   */ standardGroupUndoRedoPaste,
    /* format text      */ `bold ${Buttons.StylesGroup}`,
    /* paragraph types  */ `h2 h3 ${Buttons.HGroups.h4}`,
    /* bullets          */ 'numlist bullist outdent indent',
    /* links/media      */ `${Buttons.LinkGroup}`,
    /* content block    */ NoButtons,
    /* tools/mode switch*/ standardGroupFinal,
  ],
  'text-basic': [
    /* initial w/undo   */ standardGroupUndoRedoPaste,
    /* format text      */ `bold ${Buttons.StylesGroup}`,
    /* paragraph types  */ NoButtons,
    /* bullets          */ 'numlist bullist outdent indent',
    /* links/media      */ `link ${Buttons.LinkPageButton}`,
    /* content block    */ NoButtons,
    /* tools/mode switch*/ standardGroupFinal,
  ],
  'text-minimal': [
    /* initial w/undo   */ standardGroupUndoRedoPaste,
    /* format text      */ `bold italic`,
    /* paragraph types  */ NoButtons,
    /* bullets          */ NoButtons,
    /* links/media      */ `link ${Buttons.LinkPageButton}`,
    /* content block    */ NoButtons,
    /* tools/mode switch*/ standardGroupFinal,
  ],
  'text-plain': [
    /* initial w/undo   */ `undo redo pastetext removeformat`,
    /* tools/mode switch*/ standardGroupFinal,
  ],
  rich: [
    // Almost Default Toolbar at first
    /* initial w/undo   */ standardGroupUndoRedoPaste,
    /* format text      */ `bold ${Buttons.StylesGroup}`,
    /* paragraph types  */ `h2 ${Buttons.HGroups.h3}`,
    /* bullets          */ `numlist ${Buttons.ListGroup}`,
    /* links/media      */ `${Buttons.LinkGroup}`,
    /* content block    */ // Buttons.AddContentBlock, // Without the content-block as it will be in the second line
    /* tools/mode switch*/ standardGroupFinal,

    /* -                */ NewRow,
    /* initial w/undo   */ `${Buttons.PasteImage}`,

    /* links/media      */ `${Buttons.ImagesCmsGroup} ${Buttons.LinkAssets}`,
    /* rich media       */ Rich.ContentSplitters.map(cs => cs.name).join(' '),
    /* content block    */ Buttons.AddContentBlock,
  ],
  dialogDefault: [
    /* initial w/undo   */ standardGroupUndoRedoPaste,
    /* format text      */ `bold ${Buttons.StylesGroup}`,
    /* paragraph types  */ `h2 ${Buttons.HGroups.h3}`,
    /* bullets          */ `numlist ${Buttons.ListGroup}`,
    /* links/media      */ `${Buttons.ImagesCmsGroup}  ${Buttons.LinkAssets} ${Buttons.LinkGroupWithAnchors}`, // different from default
    /* content block    */ Buttons.AddContentBlock,
    /* tools/mode switch*/ standardGroupFinal,
  ],
};
