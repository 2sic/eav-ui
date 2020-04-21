export function attachDnnBridgeService(fieldStringWysiwyg: any, editor: any) {
  let result: any = {};
  // open the dialog - note: strong dependency on the buttons, not perfect here
  fieldStringWysiwyg.openDnnDialog = (type: any) => {
    fieldStringWysiwyg.connector._experimental.openDnnDialog(
      '', { Paths: null, FileFilter: null }, fieldStringWysiwyg.processResultOfDnnBridge
    );
  };

  // the callback when something was selected
  fieldStringWysiwyg.processResultOfDnnBridge = (value: any) => {
    result = value;
    if (!value) { return; }
    fieldStringWysiwyg.connector._experimental.getUrlOfIdDnnDialog('page:' + (value.id || value.FileId), fieldStringWysiwyg.urlCallback);
  };

  fieldStringWysiwyg.urlCallback = (data: any) => {
    const previouslySelected = editor.selection.getContent();
    editor.insertContent('<a href=\"' + data + '\">' + (previouslySelected || result.name) + '</a>');
  };
}
