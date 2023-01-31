import * as Buttons from '../../constants/buttons';
import { ButtonGroupByViewRaw, NewRow, NoButtons } from '../button-groups';

const standardGroupUndoRedoPaste = `undo redo pastetext paste removeformat`;
const standardGroupFinal = `${Buttons.Code} ${Buttons.ModeAdvanced} ${Buttons.ModeDefault} ${Buttons.DialogOpen}`;

const defaultToolbar = [
  /* initial w/undo   */ standardGroupUndoRedoPaste,
  /* format text      */ `bold ${Buttons.StylesGroup}`,
  /* paragraph types  */ `h2 ${Buttons.HGroups.h3}`,
  /* bullets          */ `numlist ${Buttons.ListGroup}`,
  /* links/media      */ `${Buttons.LinkGroup}`,
  /* rich media       */ NoButtons,
  /* content block    */ Buttons.AddContentBlock,
  /* tools/mode switch*/ standardGroupFinal,
  // /* Experiment. split*/ NewRow,
  // /* Experiment. split*/ `undo`
];

export const DefaultToolbarConfig: ButtonGroupByViewRaw = {
  all: {
    // #v1500-not-ready
    // default: ` ${C.ToolbarModeToggle} undo redo pastetext`,
    // advanced: ` ${C.ToolbarModeToggle} undo pastetext`,
    default: defaultToolbar,
    advanced: [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `styles bold ${Buttons.StylesGroup}`,
      /* paragraph types  */ `h2 ${Buttons.HGroups.h3}`,
      /* bullets          */ `numlist ${Buttons.ListGroup}`,
      /* links/media      */ `${Buttons.LinkGroupPro}`, // test
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
    'text-minimal': [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `bold italic`,
      /* paragraph types  */ NoButtons,
      /* bullets          */ NoButtons,
      /* links/media      */ `link ${Buttons.LinkPageButton}`,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ standardGroupFinal,
    ],
    'text-basic': [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `bold ${Buttons.StylesGroup}`,
      /* paragraph types  */ NoButtons,
      /* bullets          */ 'numlist bullist outdent indent',
      /* links/media      */ `${Buttons.LinkGroup}`,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ standardGroupFinal,
    ],
    rich: [
      /* default toolbar  */ ...defaultToolbar,
      /* -                */ NewRow,
      /* initial w/undo   */ `${Buttons.PasteImage}`,

      /* links/media      */ `${Buttons.ImagesCmsGroup} ${Buttons.LinkFiles}`,
      /* rich media       */ `${Buttons.XXXContentDivision} ${Buttons.ContentSectionSplitter}`,
      /* content block    */ Buttons.AddContentBlock,
    ],
  },
  dialog: {
    default: [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `bold ${Buttons.StylesGroup}`,
      /* paragraph types  */ `h2 ${Buttons.HGroups.h3}`,
      /* bullets          */ `numlist ${Buttons.ListGroup}`,
      /* links/media      */ `${Buttons.ImagesCmsGroup} ${Buttons.LinkGroupPro}`, // different from other default
      /* content block    */ Buttons.AddContentBlock,
      /* tools/mode switch*/ standardGroupFinal,
    ],
  }
};
