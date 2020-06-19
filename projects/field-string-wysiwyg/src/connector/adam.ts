import { Adam } from '../../../edit-types';

export function attachAdam(editor: any, adam: Adam) {
  adam.onItemClick = (item) => {
    const fileName = item.Name.substr(0, item.Name.lastIndexOf('.'));

    const imageMode = adam.getConfig().showImagesOnly;
    const content = imageMode
      ? '<img src="' + item.FullPath + '" + alt="' + fileName + '">'
      : '<a href="' + item.FullPath + '">' + fileName + '</a>';

    editor.insertContent(content);
  };
  adam.onItemUpload = adam.onItemClick;
  if (adam.getConfig() == null) {
    adam.setConfig({ disabled: false });
  }
}
