export class GoToCopilot {
  static route = 'copilot';
  static navLabel = 'Copilot (beta)';
  static icon = 'support_agent';

  static routeDefinition(part: string) {
    return {
      name: GoToCopilot.navLabel,
      icon: GoToCopilot.icon,
      svgIcon: false,
      path: `${part}-${GoToCopilot.route}`
    };
  }
}