/** Information how to show something - like if it's read-only and shouldn't allow editing */
export interface EditInfo {
  /** Read only is true if showing is allowed, but shouldn't allow editing */
  ReadOnly: boolean;
  /** An optional, additional message to show to the user for better understanding */
  ReadOnlyMessage?: string;
  DisableSort?: boolean;
  DisableDelete?: boolean;
  DisableRename?: boolean;
  DisableMetadata?: boolean;
  DisableEdit?: boolean;
  EnableInherit?: boolean;
}
