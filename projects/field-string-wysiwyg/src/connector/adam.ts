import { Adam, AdamItem, AdamPostResponse } from '../../../edit-types';

export function attachAdam(editor: any, adam: Adam) {
  adam.onItemClick = (item) => {
    insertContent(item, editor, adam);
  };

  adam.onItemUpload = (item) => {
    insertContent(item, editor, adam);
  };

  if (adam.getConfig() == null) {
    adam.setConfig({ disabled: false });
  }
}

function insertContent(item: AdamItem | AdamPostResponse, editor: any, adam: Adam) {
  const imageMode = adam.getConfig().showImagesOnly;
  const selected = editor.selection.getContent();
  const fileName = item.Name.substring(0, item.Name.lastIndexOf('.'));

  const content = imageMode
    ? `${selected}<img src="${item.FullPath}" alt="${fileName}">`
    : `<a href="${item.FullPath}">${selected || fileName}</a>`;

  editor.insertContent(content);
}
