import { SelectorData } from './selector-data';

export const AccessScenarios: Array<SelectorData> = [
  {
    key: 'internal',
    name: 'Internal-Access from JS in a DNN page',
    description: 'Internal access means that your JS code is running in a DNN-module on a DNN-page. This is the default access. In this scenario, various headers are included in the request, incl. the module it\'s coming from, which allows various automatic things to happen. This results in simpler REST requests.',
    notes: 'This mode also makes it easier to re-distribute your app, as you can perform API calls relative to the module that\'s hosting it. This means, that even if you export/import the app to another system, the API-calls stay the same.',
  },
  {
    key: 'external',
    name: 'External access',
    description: 'External access means that the JS code could be on another page / module in DNN (which is not the same app), or it could be coming from a mobile App, or another website altogether. In this case, automatic app-detection can\'t work, as various headers are missing, and you must access the endpoint more explicitly.',
    notes: 'This mode requires you to define the exact, full URL, so if you create copies of this app on another system, the URL must be updated to access that system specifically.',
  },
];
