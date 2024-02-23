import { NavItem } from "../../shared/models/nav-item.model";
import { eavConstants } from '../../shared/constants/eav.constants';

export const AppsAdministationNavItems: NavItem[] = [

  { name: 'Info', path: 'home', icon: 'info', svgIcon: false, tippy: 'App Info' },
  {
    name: 'Data', path: `data/${eavConstants.scopes.default.value}`, icon: 'menu', svgIcon: false, tippy: 'Data / Content', child: [
      { name: 'Copilot (beta)', path: 'copilot', icon: 'support_agent', svgIcon: false, tippy: 'Autogenerate content types ' },
      { name: 'Rest-Api', path: 'restapidata', icon: 'code-curly', svgIcon: true, tippy: 'Rest-Api Data ' },
    ]
  },
  {
    name: 'Queries',
    path: 'queries',
    icon: 'filter_list',
    svgIcon: false,
    tippy: 'Queries / Visual Query Designer',
    child: [
      { name: 'Rest-Api', path: 'restapiquerie', icon: 'code-curly', svgIcon: true, tippy: 'Rest-Api Queries' },
    ]
  },
  {
    name: 'Views',
    path: 'views',
    icon: 'layers',
    svgIcon: false,
    tippy: 'Views / Templates',
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
