import type { Editor } from 'tinymce';
import { Adam, AdamItem, AdamPostResponse } from '../../../edit-types';

export function attachAdam(editor: Editor, adam: Adam): void {
  adam.onItemClick = (item) => {
    const imageMode = adam.getConfig().showImagesOnly && item.Type === 'image';
    insertContent(item, editor, imageMode);
  };

  adam.onItemUpload = (item) => {
    const imageMode = item.Type === 'image';
    insertContent(item, editor, imageMode);
  };

  if (adam.getConfig() == null) {
    adam.setConfig({ disabled: false });
  }
}

function insertContent(item: AdamItem | AdamPostResponse, editor: Editor, imageMode: boolean): void {
  const selected = editor.selection.getContent();

  let fileName = item.Name;
  const extIndex = fileName.lastIndexOf('.');
  if (extIndex > 0) {
    fileName = fileName.substring(0, extIndex);
  }

  const imageOrFileUrl = (item as AdamItem).Url ?? (item as AdamPostResponse).Path;
  const content = imageMode
    ? `${selected}<img src="${imageOrFileUrl}" alt="${fileName}">`
    : `<a href="${imageOrFileUrl}">${selected || fileName}</a>`;

  editor.insertContent(content);
}
