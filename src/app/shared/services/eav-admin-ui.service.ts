import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogTypeConstants } from '../constants/type-constants';
import { AdminDialogData } from '../models/eav/admin-dialog-data';
import { DnnBridgeDialogData } from '../models/dnn-bridge/dnn-bridge-connector';

@Injectable()
export class EavAdminUiService {
    constructor() { }

    /**
     * Open a modal dialog containing the given component. With EntityId.
     */
    public openItemEditWithEntityId = (dialog: MatDialog, entityId: string, component: any): MatDialogRef<{}, any> => {
        return dialog.open(component, {
            width: '650px',
            data: <AdminDialogData>{
                id: entityId,
                type: DialogTypeConstants.itemEditWithEntityId
            }
        });
    }

    /**
     * Open a modal dialog containing the given component.
     */
    public openItemEditWithContent = (dialog: MatDialog, component: any): MatDialogRef<{}, any> => {
        return dialog.open(component, {
            width: '650px',
            // height: '90%',
            // disableClose = true,
            // autoFocus = true,
            data: <AdminDialogData>{
                id: null,
                type: DialogTypeConstants.itemEditWithContent
            }
        });

    }

    // TODO: unite all modals function in one.
    public openPagePickerModal = (dialog: MatDialog, component: any, type: string, connector: any): MatDialogRef<{}, any> => {
        return dialog.open(component, {
            width: '650px',
            data: <DnnBridgeDialogData>{
                id: null,
                type: type,
                connector: connector
            }
        });
    }
}
