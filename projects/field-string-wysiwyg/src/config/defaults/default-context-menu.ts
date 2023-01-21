import { ButtonGroupByViewRaw } from '../button-groups';
import { AddContentBlock } from '../public';

export const DefaultContextMenu: ButtonGroupByViewRaw = {
  all: {
    default: [`charmap hr ${AddContentBlock}`],
    text: [`charmap hr`, `link ${AddContentBlock}`],
    media: [`charmap hr`, `link image ${AddContentBlock}`],
  }
};
