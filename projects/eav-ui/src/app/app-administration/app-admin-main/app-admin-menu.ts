import { NavItem } from "../../shared/models/nav-item.model";
import { eavConstants } from '../../shared/constants/eav.constants';
import { GoToCopilot } from '../copilot/go-to-copilot';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';
import { CopilotSpecs } from '../copilot/copilot-specs';

export const AppAdminMenu: NavItem[] = [

  { name: 'App Info', path: 'home', icon: 'info', svgIcon: false, tippy: 'App Info' },
  {
    name: 'Data', path: `data/${eavConstants.scopes.default.value}`, icon: 'menu', svgIcon: false, tippy: 'Data / Content',
    child: [
      { ...GoToCopilot.routeDefinition('data'), tippy: 'Autogenerate content types ' },
      { ...GoToDevRest.routeDataDefinition, tippy: 'Rest-Api Data ' },
    ]
  },
  {
    name: 'Queries',
    path: 'queries',
    icon: 'filter_list',
    svgIcon: false,
    tippy: 'Queries / Visual Query Designer',
    child: [
      { ...GoToDevRest.routeQueryDefinition, tippy: 'Rest-Api Queries' },
    ]
  },
  {
    name: 'Views',
    path: 'views',
    icon: 'layers',
    svgIcon: false,
    tippy: 'Views / Templates',
    child: [
      {
        ...GoToCopilot.routeDefinition('views'),
        tippy: 'Autogenerate Razor Views'
      },
    ]
  },
  {
    name: 'Web API', path: 'web-api', icon: 'offline_bolt', svgIcon: false, tippy: 'WebApi',
    child: [
      {
        ...GoToCopilot.routeDefinition('web-api'),
        tippy: CopilotSpecs.webApi.teaser,
      },
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
    svgIcon: false,
    tippy: 'App Settings',
    child: [
      {
        name: 'Export App',
        path: 'export-app',
        // icon: 'browser_updated',
        // 2dm: note that I would prefer this icon, but we would first have to switch to Material Symbols
        icon: 'deployed_code_update',
        svgIcon: false,
        tippy: 'Export this entire App'
      },
      {
        name: 'Export Parts',
        path: 'export-parts',
        icon: 'cloud_download',
        svgIcon: false,
        tippy: 'Export parts of this App'
      },
      {
        name: 'Imports Parts',
        path: 'import-parts',
        icon: 'cloud_upload',
        svgIcon: false,
        tippy: 'Import parts of this App'
      },
      {
        name: 'App-State Git Sync',
        path: 'app-state',
        icon: 'sync',
        svgIcon: false,
        tippy: 'App-State Versioning'
      },
    ]
  },
];
