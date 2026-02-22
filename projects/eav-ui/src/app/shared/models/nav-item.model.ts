/** Interface to store navigation object to configure menus */
export interface NavItem {
  name: string;
  path: string;
  icon: string;
  tippy: string;
  child?: NavItem[];

  /**
   * Optional feature name to indicate if the feature is not active.
   */
  featureRequired?: string;
}
