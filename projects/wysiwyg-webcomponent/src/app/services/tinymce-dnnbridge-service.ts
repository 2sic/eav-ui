import { Injectable } from '@angular/core';

@Injectable()
export class TinyMceDnnBridgeService {
    result: any = {};

    attachDnnBridgeService(vm, editor): void {
        // open the dialog - note: strong dependency on the buttons, not perfect here
        vm.openDnnDialog = (type) => {
            // vm.host.openDnnDialog('', { Paths: null, FileFilter: null }, vm.processResultOfDnnBridge);
            vm.host.openDnnDialog('', { Paths: null, FileFilter: null }, vm.processResultOfDnnBridge);
        };

        // the callback when something was selected
        vm.processResultOfDnnBridge = (value) => {
            this.result = value;
            if (!value) { return; }
            vm.host.getUrlOfIdDnnDialog('page:' + (value.id || value.FileId), vm.urlCallback);

            //  return value;
            // $scope.$apply(function () {
            //     if (!value) return;

            //     var previouslySelected = vm.editor.selection.getContent();

            //     var promise = dnnBridgeSvc.getUrlOfId("page:" + (value.id || value.FileId)); // id on page, FileId on file
            //     return promise.then(function (result) {
            //         vm.editor.insertContent("<a href=\"" + result.data + "\">" + (previouslySelected || value.name) + "</a>");
            //     });
            // });
        };

        vm.urlCallback = (data) => {
            const previouslySelected = editor.selection.getContent();
            editor.insertContent('<a href=\"' + data + '\">' + (previouslySelected || this.result.name) + '</a>');
        };
    }
}
