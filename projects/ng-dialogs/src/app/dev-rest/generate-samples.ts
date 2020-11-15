import { ApiCall, CodeSample } from './data';


export function generateApiCalls(moduleId: number, root: string, id: number) {
  const virtual = root[0] !== '/';
  root = root + '/';
  return [
    new ApiCall(virtual, 'GET', root, 'Read list of all items', true,
      createGetSnippets(root, moduleId)),
    new ApiCall(virtual, 'GET', root + id, 'Read a single item #' + id + `(with title 'TODO:')`, true,
      createGetSnippets(root + id, moduleId)),
    new ApiCall(virtual, 'POST', root, 'Create an item', false),
    new ApiCall(virtual, 'POST', root + id, 'Update the item #' + id, false),
    new ApiCall(virtual, 'DELETE', root + id, 'Delete item #' + id, false)
  ];
}

function createGetSnippets(path: string, moduleId: number): CodeSample[] {
  return [
    new CodeSample('Example with global $2sxc and event-context',
      `<span onclick="$2sxc(this).webApi.get('${path}').then(data => console.log(data))">
  get it
</span>`),
    new CodeSample(`Example with global $2sxc and a Module-Id ${moduleId}`,
      `// get the sxc-controller for this module
var sxc = $2sxc(${moduleId});
// now get the data in the promise
sxc.webApi.get('${path}')
  .then(data => {
    console.log(data)
  });`),
    new CodeSample(`Same example as one-liner to run in the F12 console right now`,
      `$2sxc(${moduleId}).webApi.get('${path}').then(data => console.log('just got:', data));`, true, true),
    new CodeSample('Example where you get the Module-Id from Razor',
      `// this will be replaced on the server with the ID
var moduleId = @Dnn.Module.ModuleID;
var sxc = $2sxc(moduleId);
var data = sxc.webApi.get('${path}');`),
  ];
}
