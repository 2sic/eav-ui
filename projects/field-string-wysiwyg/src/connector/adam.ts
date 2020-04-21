import { AdamSetValue, AdamAfterUpload } from '../../../edit-types';
import { FieldStringWysiwygDialog } from '../main/main';

// TODO: SPM this must really become a normal class, which then becomes .adam on the field
export function attachAdam(fieldStringWysiwyg: any /* FieldStringWysiwygDialog */, editor: any) {
  const adamSetValue: AdamSetValue = (fileItem: any, modeImage: any) => {
    if (modeImage === undefined) {  // if not supplied, use the setting in the adam
      modeImage = fieldStringWysiwyg.adam.adamModeImage;
    }

    const fileName = fileItem.Name.substr(0, fileItem.Name.lastIndexOf('.'));

    const content = modeImage
      ? '<img src="' + fileItem.FullPath + '" + alt="' + fileName + '">'
      : '<a href="' + fileItem.FullPath + '">' + fileName + '</a>';

    editor.insertContent(content);
  };

  const adamAfterUpload: AdamAfterUpload = (fileItem: any) => {
    adamSetValue(fileItem, fileItem.Type === 'image');
  };

  fieldStringWysiwyg.adam = fieldStringWysiwyg.connector._experimental.attachAdam(adamSetValue, adamAfterUpload);

  fieldStringWysiwyg.toggleAdam = (imagesOnly: any, usePortalRoot: boolean) => {
    fieldStringWysiwyg.adam.adamModeImage = imagesOnly;
    fieldStringWysiwyg.adam.toggleAdam({
      showImagesOnly: imagesOnly,
      usePortalRoot,
    });
  };

  fieldStringWysiwyg.setAdamConfig = (adamConfig: any) => {
    fieldStringWysiwyg.adam.setAdamConfig(adamConfig);
  };

  fieldStringWysiwyg.setAdamConfig({ // default adam config
    adamModeConfig: { usePortalRoot: false },
    allowAssetsInRoot: true,
    autoLoad: false,
    enableSelect: true,
    folderDepth: 0,
    fileFilter: '',
    metadataContentTypes: '',
    subFolder: '',
    showImagesOnly: false, // adamModeImage?
  });
}
