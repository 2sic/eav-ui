import { NavItem } from "../../shared/models/nav-item.model";

export const AppsAdministationNavItems: NavItem[] = [
  { name: 'Info', path: 'home', icon: 'info', tippy: 'App Info' },
  { name: 'Data', path: 'data/Default', icon: 'menu', tippy: 'Data / Content' },
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
