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

  let fileName = item.Name;
  const typeIndex = fileName.lastIndexOf('.');
  if (typeIndex > 0) {
    fileName = fileName.substring(0, typeIndex);
  }

  const content = imageMode
    ? `${selected}<img src="${item.FullPath}" alt="${fileName}">`
    : `<a href="${item.FullPath}">${selected || fileName}</a>`;

  editor.insertContent(content);
}
