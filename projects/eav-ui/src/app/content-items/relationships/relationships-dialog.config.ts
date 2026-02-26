import { DialogConfig } from "../../shared/models/dialog-config.model";
import { RelationshipsPageComponent } from "./relationships-dialog";


export const relationshipsDialog: DialogConfig = {
  name: 'Relationships',

  initContext: false,

  panelSize: 'large', 

  panelClass: ['dialog-component'], 

  async getComponent() {
    return RelationshipsPageComponent;
  },
};