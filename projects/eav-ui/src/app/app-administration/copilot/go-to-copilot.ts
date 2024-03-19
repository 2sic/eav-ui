export class GoToCopilot {
  static route = 'copilot';

  static routeDefinition(part: string) {
    return {
      name: 'Copilot (beta)',
      icon: 'support_agent',
      svgIcon: false,
      path: `${part}-${GoToCopilot.route}`
    };
  }
}