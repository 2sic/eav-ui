import { Scenario } from './scenario';

export const AllScenarios: Array<Scenario> = [
  {
    key: 'internal',
    in2sxc: true,
    useVirtual: true,
    inSameSite: true,
    inSameContext: true,
    name: 'JS in this App on a page (easiest)',
    description: `Internal access means that your JS code is running in a 2sxc-module on a DNN-page.
    This is the default access.
    In this scenario, various headers are included in the request,
    incl. the module it\'s coming from, which allows various automatic things to happen.
    This results in simpler REST requests.`,
    notes: `This mode makes it easy to re-distribute your app, as you can perform API calls relative to the module that\'s hosting it.
    This means, that even if you export/import the app to another system, the API-calls stay the same.`,
  },
  {
    key: 'internal2',
    in2sxc: true,
    useVirtual: true,
    inSameSite: true,
    inSameContext: false,
    name: 'JS in a DIFFERENT 2sxc App on the SAME site',
    description: `When using JS from another app, you cannot auto-detect of the app, so the path is slightly different.`,
    notes: '',
  },
  {
    key: 'internal3',
    in2sxc: true,
    useVirtual: false,
    inSameSite: false,
    inSameContext: false,
    name: 'JS from 2sxc App on a DIFFERENT site',
    description: `When coding from another site, the path needs to be complete (not virtual), since auto-detection of site etc. can't work. `,
    notes: '',
  },
  {
    key: 'external',
    in2sxc: false,
    useVirtual: false,
    inSameSite: false,
    inSameContext: false,
    name: 'External access',
    description: 'External access means that the JS code could be on another page / module in DNN (which is not the same app), or it could be coming from a mobile App, or another website altogether. In this case, automatic app-detection can\'t work, as various headers are missing, and you must access the endpoint more explicitly.',
    notes: 'This mode requires you to define the exact, full URL, so if you create copies of this app on another system, the URL must be updated to access that system specifically.',
  },
];
