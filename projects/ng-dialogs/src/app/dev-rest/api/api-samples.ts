import { SxcRoot } from '@2sic.com/2sxc-typings';
import { ApiCall, CodeSample, hint$2sxc, Scenario, warningExternal, warningSimpleSampleOnly } from '..';
import { Context } from '../../shared/services/context';
// tslint:disable: curly

export function generateWebApiCalls($2sxc: SxcRoot, scenario: Scenario, context: Context, root: string,
  urlParams: string, verbs: string[]) {
  const virtual = root[0] !== '/' && !root.startsWith('http');

  // if urlParams exist and it doesn't starts with a ?, add that
  if (urlParams && urlParams.length && urlParams[0] !== '?')
    urlParams = '?' + urlParams;

  const contextParams = virtual
    ? `${urlParams}${urlParams ? '&' : '?'}PageId=${context.tabId}&ModuleId=${context.moduleId}`
    : '';
  const directUrl = $2sxc.http.apiUrl(root) + contextParams;
  const pathWithParams = root + urlParams;

  const result = new Array<ApiCall>();
  if (verbs.includes('GET'))
    result.push(new ApiCall(virtual, 'GET', pathWithParams, 'call the WebAPI endpoint', 'call GET on this endpoint', true,
      snippetsGet(scenario, pathWithParams, context), directUrl));

  if (verbs.includes('POST'))
    result.push(new ApiCall(virtual, 'POST', pathWithParams, 'call the WebAPI endpoint', 'call POST on this endpoint', false,
      snippetsPost(scenario, pathWithParams, context.moduleId), directUrl));

  return result;
}

function snippetsGet(scenario: Scenario, path: string, context: Context): CodeSample[] {
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
})`, false, [warningExternal]));

    // jQuery External with Context
    list.push(new CodeSample('Using jQuery with Context in URL',
      `This example uses jQuery and includes a module-context. This is unusual for external access, but may be needed sometime.`,
      `
$.ajax('${pathWithContext}').then(data => {
  console.log('Got this data:', data);
})`, false, [warningExternal]));
  }
  // return generated snippets
  return list;
}

/** Snippets for basic Post */
function snippetsPost(scenario: Scenario, path: string, moduleId: number): CodeSample[] {
  const showWarning = !scenario.inSameContext;
  return [
    new CodeSample('Basic Example',
      `This example uses the ModuleId to get the context information.
To see other ways to get the context and headers, check out the GET examples.
Note that this snippet doesn't use real names of properties to add.`,
      `// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});

// The object we'll send to get created. It's just a simple object with properties
var urlParams = {
  id: 47,
};
var postParams = {
  // related items like tags can be assigned with IDs
  // which you would usually get from somewhere first
  list: [17, 4203, 5030],
  message: 'Some Text',
};

// now create it and get the id back
sxc.webApi.post('${path}', urlParams, postParams)
  .then(data => {
    console.log('Got this ID information: ', data)
  });`,
      false,
      showWarning ? [warningSimpleSampleOnly] : []),
  ];
}
