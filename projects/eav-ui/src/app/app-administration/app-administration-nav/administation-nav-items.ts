import { NavItem } from "../../shared/models/nav-item.model";
import { eavConstants } from '../../shared/constants/eav.constants';
import { GoToCopilot } from '../data-copilot/go-to-copilot';
import { GoToDevRest } from '../../dev-rest/go-to-dev-rest';

export const AppsAdministrationNavItems: NavItem[] = [

  { name: 'Info', path: 'home', icon: 'info', svgIcon: false, tippy: 'App Info' },
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
  { name: 'Web API', path: 'web-api', icon: 'offline_bolt', svgIcon: false, tippy: 'WebApi' },
  {
    name: 'App',
    path: 'app',
    icon: 'settings_applications',
    svgIcon: false,
    tippy: 'App Settings',
  },
  { name: 'Sync', path: 'sync', icon: 'sync', svgIcon: false, tippy: 'App Export / Import' },
];
