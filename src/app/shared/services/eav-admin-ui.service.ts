import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogTypeConstants } from '../constants/type-constants';
import { AdminDialogData } from '../models/eav/admin-dialog-data';
import { DnnBridgeDialogData } from '../models/dnn-bridge/dnn-bridge-connector';
import { NgSwitchCase } from '@angular/common';

@Injectable()
export class EavAdminUiService {
    constructor() { }

    /**
      * Open a modal dialog containing the given component.
      */
    public openItemEditWithContent = (dialog: MatDialog, component: any): MatDialogRef<{}, any> => {
        return this.openModalDialog(dialog, component, null, null, DialogTypeConstants.itemEditWithContent);
    }

    /**
     * Open a modal dialog containing the given component. With EntityId.
     */
    public openItemEditWithEntityId = (dialog: MatDialog, component: any, entityId: string): MatDialogRef<{}, any> => {
        return this.openModalDialog(dialog, component, entityId, null, DialogTypeConstants.itemEditWithEntityId);
    }

    /**
    * Open a modal dialog containing the given component.
    */
    public openItemNewEntity = (dialog: MatDialog, component: any, contentTypeName: any): MatDialogRef<{}, any> => {
        return this.openModalDialog(dialog, component, null, contentTypeName, DialogTypeConstants.itemNewEntity);
    }

    /**
     * Open a modal dialog containing the given component.
     */
    public openModalDialog = (
        dialog: MatDialog,
        component: any,
        entityId: string,
        contentTypeName: any,
        dialogType: DialogTypeConstants
    ): MatDialogRef<{}, any> => {
        let item = null;
        switch (dialogType) {
            case DialogTypeConstants.itemEditWithEntityId:
                item = `[{ 'EntityId': ${Number(entityId)} }]`;
                break;
            case DialogTypeConstants.itemNewEntity:
                item = `[{ 'ContentTypeName': '${contentTypeName}' }]`;
                break;
            default:
                break;
        }

        return dialog.open(component, {
            width: '650px',
            // height: '90%',
            // disableClose = true,
            // autoFocus = true,
            data: <AdminDialogData>{
                dialogType,
                item
            }
        });
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
