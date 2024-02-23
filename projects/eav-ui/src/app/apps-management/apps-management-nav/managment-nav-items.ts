import { NavItem } from "../../shared/models/nav-item.model";

export const AppsManagementNavItems: NavItem[] = [
  {
    name: 'System', path: 'system', icon: 'settings', svgIcon: false, tippy: 'System Info', child: [
      { name: 'Register', path: 'registration', icon: 'how_to_reg', svgIcon: false, tippy: 'Register this System on 2sxc Patrons' },
    ]
  },
  { name: 'Apps', path: 'list', icon: 'star_border', svgIcon: false, tippy: 'Apps' },
  { name: 'Languages', path: 'languages', icon: 'translate', svgIcon: false, tippy: 'Languages' },
  { name: 'Extensions / Features', path: 'license', icon: 'tune', svgIcon: false, tippy: 'Extensions and Features' },
];
