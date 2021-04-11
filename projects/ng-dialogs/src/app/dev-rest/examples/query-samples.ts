import { SxcRoot } from '@2sic.com/2sxc-typings';
import { ApiCall, CodeSample, hint$2sxc, Scenario, warningExternal } from '..';
import { Context } from '../../shared/services/context';
// tslint:disable: curly


export function generateQueryCalls($2sxc: SxcRoot, scenario: Scenario, context: Context, root: string, id: number, streamNames: string) {
  const virtual = root[0] !== '/' && !root.startsWith('http');
  // root = root + '/';
  // const withId = root + id;
  const contextParams = virtual ? `?PageId=${context.tabId}&ModuleId=${context.moduleId}` : '';
  const directUrl = $2sxc.http.apiUrl(root) + contextParams;
  // const directWId = $2sxc.http.apiUrl(withId) + contextParams;
  var pathWithStream = root + '/' + (streamNames ?? 'Default');

  return [
    new ApiCall(virtual, 'GET', root, 'read all query streams', 'Read list of all items', true,
      snippetsGet(scenario, root, context), directUrl),

    new ApiCall(virtual, 'GET', pathWithStream, 'read only Stream Default', 'Read list of all items', true,
      snippetsGet(scenario, root, context), directUrl),

    // #todoquery 2dm
    // 1. Sample with stream name
    // 1. sample with stream names (plural)
    // 1. later sample with IDs
    // 1. later maybe sample with guids, but not certain because it's kind of an unexpected opening
  ];
}

function snippetsGet(scenario: Scenario, path: string, context: Context, streamNames?: string): CodeSample[] {
  const moduleId = context.moduleId;
  const virtual = path[0] !== '/';
  const list: CodeSample[] = [];
  const pathWithContext = `${path}?PageId=${context.tabId}&ModuleId=${context.moduleId}`;

  if (scenario.inSameContext)
    list.push(new CodeSample('Example with global $2sxc and event-context',
      'This example finds the context information from the HTML where an action started.',
      `
<button onclick="$2sxc(this).webApi.get('${path}').then(data => console.log(data))">
  get it
</button>`, false, [hint$2sxc]));

  if (scenario.in2sxc)
    list.push(new CodeSample(`Example with global $2sxc and a Module-Id ${moduleId}`,
      `This is how you get the context when your code doesn't start with a DOM context, so you need the moduleId.`,
      `
// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});
// now get the data in the promise
sxc.webApi.get('${path}')
  .then(data => {
    console.log(data)
  });`,
      false, [hint$2sxc]),
      new CodeSample(`Same example as one-liner`,
        'This is the same as above, but as a one-liner so you can run it directly in the F12 console right now.',
        `$2sxc(${moduleId}).webApi.get('${path}').then(data => console.log('just got:', data));`, true));

  if (scenario.in2sxc && scenario.inSameContext)
    list.push(new CodeSample('Example where you get the Module-Id from Razor',
      `This example doesn't use a fixed moduleId but let's the Razor add the current moduleId when the page is rendered.`,
      `
// this will be replaced on the server with the ID
var moduleId = @Dnn.Module.ModuleID;
var sxc = $2sxc(moduleId);
var promise = sxc.webApi.get('${path}');`, false, [hint$2sxc]));

  // jquery examples, they differ based on the scenario
  const endPointGetter = virtual ? `$2sxc.http.apiUrl('${path}')` : `'${path}'`;
  const endPointGetWithParams = virtual ? `$2sxc.http.apiUrl('${pathWithContext}')` : `'${pathWithContext}'`;
  if (scenario.inSameSite) {
    // jQuery using setModuleHeaders
    list.push(new CodeSample('Using jQuery inside DNN',
      `This example uses jQuery instead of the $2sxc to do the AJAX call.
      It shows you how to resolve the virtual path for use in other ways.`,
      `
var endpoint = ${endPointGetter};
$.ajax({
  url:endpoint,
  beforeSend: $.dnnSF(${moduleId}).setModuleHeaders
}).then(data => {
  console.log('Got this data:', data);
})`, false, []));

    // jQuery Single-Liner
    list.push(new CodeSample('Using jQuery as single-liner',
      `The same example as above, just as single-liner so you can test it directly in the F12 console.
      This will only work if you're on a DNN page with this module.`,
      `$.ajax({url: ${endPointGetter}, beforeSend: $.dnnSF(${moduleId}).setModuleHeaders }).then(data => console.log(data))`,
      false, []));

    // jQuery without setModuleHeaders
    list.push(new CodeSample('Using jQuery and add Context in URL',
      `This example uses jQuery instead of the $2sxc to do the AJAX call.
      But instead of using the DNN Services Framework it adds relevant headers to the url.`,
      `
$.ajax(${endPointGetWithParams}).then(data => {
  console.log('Got this data:', data);
})`, false, []));

    // jQuery Single-Liner without SetModuleHeaders
    list.push(new CodeSample('Using jQuery with url-context as single-liner',
      `The same example as above, just as single-liner so you can test it directly in the F12 console.
      This will work on a DNN page which has jQuery activated. `,
      `$.ajax(${endPointGetWithParams}).then(data => console.log(data))`,
      false, []));

  } else {
    // jQuery External
    list.push(new CodeSample('Using jQuery in another Site or External',
      `This example uses jQuery and doesn't use $2sxc or the DNN ServicesFramework,
      because they would be either missing, or give wrong context-headers.`,
      `
$.ajax('${path}').then(data => {
  console.log('Got this data:', data);
})`, false, [ warningExternal  ]));

    // jQuery External with Context
    list.push(new CodeSample('Using jQuery with Context in URL',
      `This example uses jQuery and includes a module-context. This is unusual for external access, but may be needed sometime.`,
      `
$.ajax('${pathWithContext}').then(data => {
  console.log('Got this data:', data);
})`, false, [ warningExternal ]));
  }
  // return generated snippets
  return list;
}


