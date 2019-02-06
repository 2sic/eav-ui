import { Injectable } from '@angular/core';

@Injectable()
export class TinyMceAdamService {

    attachAdam(vm, tinymce) {
        vm.adam = vm.host.attachAdam();

        vm.adamSetValue = (fileItem, modeImage) => {
            if (modeImage === undefined) {  // if not supplied, use the setting in the adam
                modeImage = vm.adam.adamModeImage;
            }

            const fileName = fileItem.Name.substr(0, fileItem.Name.lastIndexOf('.'));

            const content = modeImage
                ? '<img src="' + fileItem.FullPath + '" + alt="' + fileName + '">'
                : '<a href="' + fileItem.FullPath + '">' + fileName + '</a>';
            // var body = vm.editor.getBody();
            // vm.editor.selection.setCursorLocation(body, 0);
            // debugger;
            // var range = window.savedRange;
            // vm.editor.selection.setCursorLocati

            tinymce.get(vm.id).insertContent(content);
        };

        vm.adamAfterUpload = (fileItem) => {
            vm.adamSetValue(fileItem, fileItem.Type === 'image');
        };

        vm.toggleAdam = (imagesOnly, usePortalRoot) => {
            vm.adam.adamModeImage = imagesOnly;
            vm.adam.toggleAdam({
                showImagesOnly: imagesOnly,
                usePortalRoot: usePortalRoot
            });
        };

        vm.setAdamConfig = (adamConfig) => {
            vm.adam.setAdamConfig(adamConfig);
        };
    }
}

