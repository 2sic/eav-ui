import { DialogConfig } from "../../shared/models/dialog-config.model";
import { RelationshipsPageComponent } from "./relationships-dialog";


export const relationshipsDialog: DialogConfig = {
  name: 'RELATIONSHIPS_DIALOG',

  initContext: false,

  panelSize: 'medium', 

  panelClass: ['dialog-component'], 

  async getComponent() {
    return RelationshipsPageComponent;
  },
};