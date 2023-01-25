import * as Buttons from '../../constants/buttons';
import { ButtonGroupByViewRaw } from '../button-groups';


export const DefaultContextMenu: ButtonGroupByViewRaw = {
  all: {
    default: [`charmap hr ${Buttons.AddContentBlock}`],
    text: [`charmap hr`, `link ${Buttons.AddContentBlock}`],
    media: [`charmap hr`, `link image ${Buttons.AddContentBlock}`],
  }
};
