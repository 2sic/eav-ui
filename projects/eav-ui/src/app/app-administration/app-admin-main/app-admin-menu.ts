import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { eavConstants } from '../../shared/constants/eav.constants';
import { NavItem } from "../../shared/models/nav-item.model";
import { GoToCopilot } from '../copilot/go-to-copilot';
import { GoToRecycleBin } from '../recycle-bin/go-to-recycle-bin';

export const AppAdminMenu: NavItem[] = [
  { name: 'App Info', path: 'home', icon: 'info', tippy: 'App Info' },
  {
    name: 'Data', path: `data/${eavConstants.scopes.default.value}`, icon: 'menu', tippy: 'Data / Content',
    child: [
      GoToCopilot.routeDefinition('data'),
      GoToDevRest.routeDataDefinition,
      GoToRecycleBin.routeDefinition('data'),
    ]
  },
  {
    name: 'Queries',
    path: 'queries',
    icon: 'filter_list',
    tippy: 'Queries / Visual Query Designer',
    child: [
      GoToDevRest.routeQueryDefinition,
    ]
  },
  {
    name: 'Views',
    path: 'views',
    icon: 'layers',
    tippy: 'Views / Templates',
    child: [
      GoToCopilot.routeDefinition('views'),
    ]
  },
  {
    name: 'App Extensions',
    path: 'extensions',
    icon: 'extension',
    tippy: 'App Extensions',
  },
  {
    name: 'Web API', path: 'web-api', icon: 'offline_bolt', tippy: 'WebApi',
    child: [
      GoToCopilot.routeDefinition('webApi'),
      {
        ...GoToDevRest.routeWebApiDefinition,
        tippy: 'Rest-Api Queries'
      },
    ]
  },
  {
    name: 'App',
    path: 'app',
    icon: 'settings_applications',
    tippy: 'App Settings',
  },
  {
    name: 'Import/Export',
    path: 'import-export',
    icon: 'cloud_sync',
    tippy: 'Import Export',
    child: [
      {
        name: 'Export App',
        path: 'export-app',
        icon: 'deployed_code_update',
        tippy: 'Export this entire App'
      },
      {
        name: 'Data Bundles (beta)',
        path: 'data-bundles',
        icon: 'dataset',
        tippy: 'Data Bundles'
      },
      {
        name: 'Export Parts',
        path: 'export-parts',
        icon: 'cloud_download',
        tippy: 'Export parts of this App'
      },
      {
        name: 'Import Parts',
        path: 'import-parts',
        icon: 'cloud_upload',
        tippy: 'Import parts of this App'
      },
      {
        name: 'App-State Git Sync',
        path: 'app-state',
        icon: 'sync',
        tippy: 'App-State Versioning'
      },
    ]
  },
];
