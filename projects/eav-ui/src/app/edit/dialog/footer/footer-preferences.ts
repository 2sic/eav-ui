import { Of } from '../../../../../../core/type-utilities';
import { DebugTypes } from './edit-dialog-footer.models';

/**
 * User preferences how the footer should be displayed.
 */
export const footerPreferences = {
  key: 'edit-dialog-footer',
  data: {
    /** Which tab is expanded (or none) */
    tab: null as Of<typeof DebugTypes>,
    /**  */
    expanded: false,
    /** Expansion size, as it can be larger (2) */
    size: 0,
    /** If the footer is pinned, e.g. visible on load. If null, will be prefilled with user-host-status */
    pinned: null as boolean,
  }
};
