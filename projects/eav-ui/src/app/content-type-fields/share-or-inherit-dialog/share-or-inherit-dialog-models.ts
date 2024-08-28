import { Field } from "../../shared/fields/field.model";

export interface ShareOrInheritDialogViewModel {
  shareableFields: Field[];
}

export enum SharingOrInheriting {
  None,
  Sharing,
  Inheriting
}
