import { ApiCall, CodeSample } from '.';

export function generateApiCalls(moduleId: number, root: string, id: number) {
  const virtual = root[0] !== '/';
  root = root + '/';
  return [
    new ApiCall(virtual, 'GET', root, 'read all', 'Read list of all items', true,
      snippetsGet(root, moduleId)),
    new ApiCall(virtual, 'GET', root + id, 'read one', 'Read a single item #' + id + `(with title 'TODO:')`, true,
      snippetsGet(root + id, moduleId)),
    new ApiCall(virtual, 'POST', root, 'create', 'Create an item', false, snippetsCreate(root, moduleId)),
    new ApiCall(virtual, 'POST', root + id, 'update', 'Update the item #' + id, false, snippetsUpdate(root + id, moduleId)),
    new ApiCall(virtual, 'DELETE', root + id, 'delete', 'Delete item #' + id, false, snippetsDelete(root + id, moduleId)),
  ];
}

function snippetsGet(path: string, moduleId: number): CodeSample[] {
  return [
    new CodeSample('Example with global $2sxc and event-context',
      'This example finds the context information from the HTML where an action started.',
      `<span onclick="$2sxc(this).webApi.get('${path}').then(data => console.log(data))">
  get it
</span>`),
    new CodeSample(`Example with global $2sxc and a Module-Id ${moduleId}`,
      `This is how you get the context when your code doesn't start with a DOM context, so you need the moduleId.`,
      `// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});
// now get the data in the promise
sxc.webApi.get('${path}')
  .then(data => {
    console.log(data)
  });`),
    new CodeSample(`Same example as one-liner`,
      'This is the same as above, but as a one-liner so you can run it directly in the F12 console right now.',
      `$2sxc(${moduleId}).webApi.get('${path}').then(data => console.log('just got:', data));`, true, true),
    new CodeSample('Example where you get the Module-Id from Razor',
      `This example doesn't use a fixed moduleId but let's the Razor add the current moduleId when the page is rendered.`,
      `// this will be replaced on the server with the ID
var moduleId = @Dnn.Module.ModuleID;
var sxc = $2sxc(moduleId);
var data = sxc.webApi.get('${path}');`),
    new CodeSample('Using jQuery',
    `This example uses jQuery instead of the $2sxc to do the AJAX call.
    It shows you how to resolve the virtual path for use in other ways.`,
    `var endpoint = $2sxc.http.apiUrl('${path}');
$.ajax({
  url:endpoint,
  beforeSend: $.dnnSF(${moduleId}).setModuleHeaders
})}).then(data => {
  console.log('Got this data:', data);
})`),
new CodeSample('Using jQuery as single-liner (run in the console of the DNN page',
  `The same example as above, just as single-liner so you can test it directly in the F12 console.
  This will only work if you're on a DNN page with this module.`,
`$.ajax({url: $2sxc.http.apiUrl('${path}'), beforeSend: $.dnnSF(${moduleId}).setModuleHeaders }).then(data => console.log(data))`)
  ];
}

/** Snippets for basic Post-Create */
function snippetsCreate(path: string, moduleId: number): CodeSample[] {
  return [
    new CodeSample('Basic Example',
      `This example uses the ModuleId to get the context information.
To see other ways to get the context and headers, check out the GET examples.
Note that this snippet doesn't use real names of properties to add.`,
`// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});

// The object we'll send to get created. It's just a simple object with properties
var newThing = {
  property1: 17,
  property2: 'Some Text',
  // related items like tags can be assigned with IDs
  // which you would usually get from somewhere first
  propertyPointingToOtherIds: [74,50203],
};

// now create it and get the id back
sxc.webApi.post('${path}', newThing)
  .then(data => {
    console.log('Got this ID information: ', data)
  });`),
  ];
}

/** Snippets for basic Post-Update */
function snippetsUpdate(path: string, moduleId: number): CodeSample[] {
  return [
    new CodeSample('Basic Example',
    `This example uses the ModuleId to get the context information.
To see other ways to get the context and headers, check out the GET examples.
Note that this snippet doesn't use real names of properties to add.`,
`// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});

// The object we'll send to update the data. It's just a simple object with properties
var updateProperty1And2 = {
  property1: 2742,
  property2: 'Changed Text',
};

// now update the item
sxc.webApi.post('${path}', updateProperty1And2)
  .then(data => {
    console.log('Update completed', data)
  });`),
  ];
}

/** Snippets for basic Post-Update */
function snippetsDelete(path: string, moduleId: number): CodeSample[] {
  return [
    new CodeSample('Basic Example',
    `This example uses the ModuleId to get the context information.
To see other ways to get the context and headers, check out the GET examples.
Note that this snippet doesn't use real names of properties to add.`,
`// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});

// delete the item
sxc.webApi.delete('${path}')
  .then(data => {
    console.log('Delete completed', data)
  });`),
  ];
}
