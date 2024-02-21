import { NavItem } from "../../shared/models/nav-item.model";
import { eavConstants } from '../../shared/constants/eav.constants';

export const AppsAdministationNavItems: NavItem[] = [

  { name: 'Info', path: 'home', icon: 'info', tippy: 'App Info' },
  {
    name: 'Data', path: `data/${eavConstants.scopes.default.value}`, icon: 'menu', tippy: 'Data / Content', child: [
      { name: 'CoPilot', path: 'copilot', icon: 'support_agent', tippy: 'Autogenerate content types ' },
    ]
  },
  {
    name: 'Queries',
    path: 'queries',
    icon: 'filter_list',
    tippy: 'Queries / Visual Query Designer',
  },
  {
    name: 'Views',
    path: 'views',
    icon: 'layers',
    tippy: 'Views / Templates',
  },
  { name: 'Web API', path: 'web-api', icon: 'offline_bolt', tippy: 'WebApi' },
  {
    name: 'App',
    path: 'app',
    icon: 'settings_applications',
    tippy: 'App Settings',
  },
  { name: 'Sync', path: 'sync', icon: 'sync', tippy: 'App Export / Import' },
];
