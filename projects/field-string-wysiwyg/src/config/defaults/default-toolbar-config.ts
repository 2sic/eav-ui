import * as Buttons from '../../constants/buttons';
import { ButtonGroupByViewRaw, NewRow, NoButtons } from '../button-groups';
import * as Reg from '../public';


const standardGroupUndoRedoPaste = `undo redo pastetext paste removeformat`;
const standardGroupFinal = `${Buttons.Code} ${Buttons.ModeAdvanced} ${Buttons.ModeDefault} ${Buttons.DialogOpenButton}`;

const defaultToolbar = [
  /* initial w/undo   */ standardGroupUndoRedoPaste,
  /* format text      */ `bold ${Reg.StylesGroup}`,
  /* paragraph types  */ `h2 ${Reg.HGroups.h3}`,
  /* bullets          */ `numlist ${Reg.ListGroup}`,
  /* links/media      */ `${Reg.LinkGroup}`,
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
      /* format text      */ `styles bold ${Reg.StylesGroup}`,
      /* paragraph types  */ `h2 ${Reg.HGroups.h3}`,
      /* bullets          */ `numlist ${Reg.ListGroup}`,
      /* links/media      */ `${Reg.LinkGroupPro}`, // test
      /* content block    */ NoButtons,
      /* tools/mode switch*/ standardGroupFinal,
    ],
    text: [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `bold ${Reg.StylesGroup}`,
      /* paragraph types  */ `h2 h3 ${Reg.HGroups.h4}`,
      /* bullets          */ 'numlist bullist outdent indent',
      /* links/media      */ `${Reg.LinkGroup}`,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ standardGroupFinal,
    ],
    'text-minimal': [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `bold italic`,
      /* paragraph types  */ NoButtons,
      /* bullets          */ NoButtons,
      /* links/media      */ `link ${Reg.LinkPageButton}`,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ standardGroupFinal,
    ],
    'text-basic': [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `bold ${Reg.StylesGroup}`,
      /* paragraph types  */ NoButtons,
      /* bullets          */ 'numlist bullist outdent indent',
      /* links/media      */ `${Reg.LinkGroup}`,
      /* content block    */ NoButtons,
      /* tools/mode switch*/ standardGroupFinal,
    ],
    rich: [
      /* default toolbar  */ ...defaultToolbar,
      /* -                */ NewRow,
      /* initial w/undo   */ `${Buttons.PasteImage}`,  // TODO: create pasteimage

      /* links/media      */ `${Reg.ImagesGroupPro} ${Reg.LinkFiles}`,
      /* rich media       */ `${Buttons.XXXContentDivision} ${Buttons.AddContentSplit}`,
      /* content block    */ Buttons.AddContentBlock,
    ],
  },
  dialog: {
    default: [
      /* initial w/undo   */ standardGroupUndoRedoPaste,
      /* format text      */ `bold ${Reg.StylesGroup}`,
      /* paragraph types  */ `h2 ${Reg.HGroups.h3}`,
      /* bullets          */ `numlist ${Reg.ListGroup}`,
      /* links/media      */ `${Reg.ImagesGroupPro} ${Reg.LinkGroupPro}`, // different from other default
      /* content block    */ Buttons.AddContentBlock,
      /* tools/mode switch*/ standardGroupFinal,
    ],
  }
};
