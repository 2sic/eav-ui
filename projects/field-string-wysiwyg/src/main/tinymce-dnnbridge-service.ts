export function attachDnnBridgeService(fieldStringWysiwyg: any, editor: any) {
  let result: any = {};
  // open the dialog - note: strong dependency on the buttons, not perfect here
  fieldStringWysiwyg.openDnnDialog = (type: any) => {
    fieldStringWysiwyg.host.openDnnDialog('', { Paths: null, FileFilter: null }, fieldStringWysiwyg.processResultOfDnnBridge);
  };

  // the callback when something was selected
  fieldStringWysiwyg.processResultOfDnnBridge = (value: any) => {
    result = value;
    if (!value) { return; }
    fieldStringWysiwyg.host.getUrlOfIdDnnDialog('page:' + (value.id || value.FileId), fieldStringWysiwyg.urlCallback);
  };

  fieldStringWysiwyg.urlCallback = (data: any) => {
    const previouslySelected = editor.selection.getContent();
    editor.insertContent('<a href=\"' + data + '\" target=\"_blank\">' + (previouslySelected || result.name) + '</a>');
  };
}
