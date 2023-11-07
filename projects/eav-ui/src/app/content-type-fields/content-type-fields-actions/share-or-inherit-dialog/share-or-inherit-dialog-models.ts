import { Field } from "../../models/field.model";

export interface ShareOrInheritDialogViewModel {
  shareableFields: Field[];
}

export enum SharingOrInheriting {
  None,
  Sharing,
  Inheriting
}

export interface SharingOrInheritingResult { 
  state: SharingOrInheriting;
  guid: string;
}