export function attachAdam(that: any, editor: any) {
  const adamSetValue = (fileItem: any, modeImage: any) => {
    if (modeImage === undefined) {  // if not supplied, use the setting in the adam
      modeImage = that.adam.adamModeImage;
    }

    const fileName = fileItem.Name.substr(0, fileItem.Name.lastIndexOf('.'));

    const content = modeImage
      ? '<img src="' + fileItem.FullPath + '" + alt="' + fileName + '">'
      : '<a href="' + fileItem.FullPath + '">' + fileName + '</a>';

    editor.insertContent(content);
  };

  const adamAfterUpload = (fileItem: any) => {
    adamSetValue(fileItem, fileItem.Type === 'image');
  };

  that.adam = that.host.attachAdam(adamSetValue, adamAfterUpload);

  that.toggleAdam = (imagesOnly: any, usePortalRoot: any) => {
    that.adam.adamModeImage = imagesOnly;
    that.adam.toggleAdam({
      showImagesOnly: imagesOnly,
      usePortalRoot: usePortalRoot
    });
  };

  that.setAdamConfig = (adamConfig: any) => {
    that.adam.setAdamConfig(adamConfig);
  };
}
