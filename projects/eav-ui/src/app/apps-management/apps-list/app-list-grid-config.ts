import { AgBoolCellIconSettings } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-params';

export const AppListShowIcons: AgBoolCellIconSettings = {
  tooltips: {
    true: 'Show this app to users',
    false: 'Hide this app from users',
  },

  icons: {
    true: 'visibility',
    false: 'visibility_off',
  },
};

export const AppListCodeErrorIcons: AgBoolCellIconSettings = {
  tooltips: {
    true: 'This App uses obsolete code which will cause problems on future upgrades. Click to see details.',
    false: 'Hide this app from users',
  },

  icons: {
    true: 'bug_report',
    false: '',
  },
};
