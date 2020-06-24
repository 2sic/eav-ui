import { Adam } from '../../../edit-types';

export function attachAdam(editor: any, adam: Adam) {
  adam.onItemClick = (item) => {
    const imageMode = adam.getConfig().showImagesOnly;
    const selected = editor.selection.getContent();
    const fileName = item.Name.substring(0, item.Name.lastIndexOf('.'));

    const content = imageMode
      ? `${selected}<img src="${item.FullPath}" alt="${fileName}">`
      : `<a href="${item.FullPath}">${selected || fileName}</a>`;

    editor.insertContent(content);
  };

  adam.onItemUpload = adam.onItemClick;

  if (adam.getConfig() == null) {
    adam.setConfig({ disabled: false });
  }
}
