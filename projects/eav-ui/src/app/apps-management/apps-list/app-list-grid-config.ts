import { AgBoolCellIconSettings } from '../../shared/ag-grid/apps-list-show/ag-bool-icon-params';
import { EavWindow } from '../../shared/models/eav-window.model';
import { App } from '../models/app.model';

declare const window: EavWindow;

export const AppListShowIcons: AgBoolCellIconSettings = {
  states: {
    true: {
      tooltip: 'Show this app to users',
      icon: 'visibility',
    },
    false: {
      tooltip: 'Hide this app from users',
      icon: 'visibility_off',
    }
  }
};

export const AppListCodeErrorIcons: AgBoolCellIconSettings = {
  states: {
    true: {
      clickable: true,
      tooltip: 'This App uses obsolete code which will cause problems on future upgrades. Click to see details.',
      icon: 'bug_report',
      getUrl: (data: App) => window.$2sxc.http.apiUrl('sys/insights/logs?key=warnings-obsolete&filter=AppId=' + data.Id),
    },
    false: {
      tooltip: 'Hide this app from users',
      icon: '',
    }
  }
};
