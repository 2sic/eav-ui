export interface CopilotSpec {
  /** Title in the menu */
  title: string;
  /** Title in the breadcrumb */
  breadcrumb: string;

  heading: string,
  intro: string,
  teaser: string;
  outputType: string;
}

const intro = `The Copilot provides tools to help you create code.
    It is still in new, so please use it carefully and report any issues.`;

export const CopilotSpecs: { [key: string ]: CopilotSpec } = {
  'data': {
    title: 'Data Copilot',
    breadcrumb: '2sxc Data Copilot',

    heading: '2sxc Data Copilot',
    intro,
    teaser: 'Autogenerate content types',

    outputType: 'DataModel',
  },
  'views': {
    title: 'Views Copilot',
    breadcrumb: '2sxc View Copilot',

    heading: '2sxc View Copilot',
    intro,
    teaser: 'Autogenerate Razor Views',

    outputType: 'RazorView',
  },
  'webApi': {
    title: 'WebApi Copilot',
    breadcrumb: '2sxc WebApi Copilot',

    heading: '2sxc WebApi Copilot',
    intro,
    teaser: 'Autogenerate WebApi Controllers',

    outputType: 'WebApi',
  }
};
