import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, DialogPosition } from '@angular/material/dialog';
import { DialogTypeConstants } from '../constants/type-constants';
import { AdminDialogData } from '../models/eav/admin-dialog-data';
import { DnnBridgeDialogData } from '../models/dnn-bridge/dnn-bridge-connector';
import { AdminDialogPersistedData } from '../models/eav';

@Injectable()
export class EavAdminUiService {
    constructor() { }

    /**
      * Open a modal dialog containing the given component.
      */
    public openItemEditWithContent = (
        dialog: MatDialog, component: any, persistedData: AdminDialogPersistedData
    ): MatDialogRef<{}, any> => {
        return this.openModalDialog(dialog, component, null, null, DialogTypeConstants.itemEditWithContent, persistedData);
    }

    /**
     * Open a modal dialog containing the given component. With EntityId.
     */
    public openItemEditWithEntityId = (dialog: MatDialog, component: any, entityId: string): MatDialogRef<{}, any> => {
        return this.openModalDialog(dialog, component, entityId, null, DialogTypeConstants.itemEditWithEntityId, null);
    }

    /**
    * Open a modal dialog containing the given component. With ContentTypeName
    */
    public openItemNewEntity = (
        dialog: MatDialog,
        component: any,
        contentTypeName: any,
        persistedData: AdminDialogPersistedData
    ): MatDialogRef<{}, any> => {
        return this.openModalDialog(dialog, component, null, contentTypeName, DialogTypeConstants.itemNewEntity, persistedData);
    }

    /**
     * Open a modal dialog containing the given component.
     */
    public openModalDialog = (
        dialog: MatDialog,
        component: any,
        entityId: string,
        contentTypeName: any,
        dialogType: DialogTypeConstants,
        persistedData: AdminDialogPersistedData
    ): MatDialogRef<{}, any> => {
        let item = null;
        let payload = null;
        switch (dialogType) {
            case DialogTypeConstants.itemEditWithEntityId:
                payload = {
                    EntityId: Number(entityId),
                };
                // item = `[{ 'EntityId': ${Number(entityId)} }]`;
                break;
            case DialogTypeConstants.itemNewEntity:
                payload = {
                    ContentTypeName: contentTypeName,
                    For: persistedData && persistedData.metadataFor ? persistedData.metadataFor : null,
                };
                // item = `[{ 'ContentTypeName': '${contentTypeName}', 'For': { } }]`;
                break;
            default:
                break;
        }
        // todo: check if persistedData has metadata, then attach to teh item
        if (payload) {
            item = [{
                ...payload,
            }];
        }

        return dialog.open(component, {
            panelClass: 'c-multi-item-dialog',
            autoFocus: false,
            // position: <DialogPosition>{ top: '10px', bottom: '10px', left: '24px', right: '24px' },
            position: <DialogPosition>{ top: '24px' },
            width: '100vw',
            maxWidth: 960,
            //  maxHeight: '80vh',
            // scrollStrategy: overlay.scrollStrategies.reposition(),
            // height: 'inherit',

            // panelClass: 'mdc-layout-grid__cell--span-6',
            // width: '30%',
            // height: '90%',
            // disableClose = true,
            data: <AdminDialogData>{
                dialogType,
                item,
                persistedData
            }
        }
        );
    }

    // TODO: unite all modals function in one.
    public openPagePickerModal = (dialog: MatDialog, component: any, type: string, connector: any): MatDialogRef<{}, any> => {
        return dialog.open(component, {
            width: '650px',
            data: <DnnBridgeDialogData>{
                type: type,
                connector: connector
            }
        });
    }
}
