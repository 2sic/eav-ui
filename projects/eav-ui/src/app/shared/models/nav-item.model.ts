/** Interface to store navigation object to configure menus */
export interface NavItem {
  name: string;
  path: string;
  icon: string;
  svgIcon: boolean;
  tippy: string;
  child?: NavItem[];
}
