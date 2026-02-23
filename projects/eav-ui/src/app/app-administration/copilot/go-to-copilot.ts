import { CopilotSpecs } from './copilot-specs';

export class GoToCopilot {
  static route = 'copilot';

  static routeDefinition(part: string) {
    return {
      name: 'Copilot',
      icon: 'support_agent',
      svgIcon: false,
      path: `${CopilotSpecs[part]?.route || part}-${GoToCopilot.route}`,
      // tippy: `Autogenerate ${partNameForTooltip}`
      tippy: CopilotSpecs[part]?.teaser,
    };
  }
}