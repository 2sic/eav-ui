import { NavItem } from "../../shared/models/nav-item.model";

export const AppsManagementNavItems: NavItem[] = [
  {
    name: 'System', path: 'system', icon: 'settings', tippy: 'System Info', child: [
      { name: 'Register', path: 'registration', icon: 'how_to_reg', tippy: 'Register this System on 2sxc Patrons' },
    ]
  },
  { name: 'Apps', path: 'list', icon: 'star_border', tippy: 'Apps' },
  { name: 'Languages', path: 'languages', icon: 'translate', tippy: 'Languages' },
  { name: 'Extensions / Features', path: 'license', icon: 'tune', tippy: 'Extensions and Features' },
];
