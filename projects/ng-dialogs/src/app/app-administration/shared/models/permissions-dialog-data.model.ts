export class PermissionsDialogData {
  constructor(
    public appId: number,
    public staticName: string,
    public type?: number,
    public keyType?: string,
  ) { }
}
