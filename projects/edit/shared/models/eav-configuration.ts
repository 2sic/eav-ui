import { VersioningOptions } from './eav/versioning-options';
import { SxcRoot } from '@2sic.com/2sxc-typings';
declare const $2sxc: SxcRoot;

export class EavConfig {
  public systemroot: string;

  constructor(
    public zoneId: string,
    public appId: string,
    public approot: string,
    public cbid: string,
    public debug: string,
    public dialog: string,
    public items: string,
    public lang: string,
    public langpri: string,
    public langs: string,
    public mid: string,
    public mode: string,
    public partOfPage: string,
    public portalroot: string,
    public publishing: string,
    public tid: string,
    public rvt: string,
    public websiteroot: string,
    public versioningOptions: VersioningOptions,
  ) {
    this.systemroot = ($2sxc.env as any).uiRoot(); // websiteroot + 'desktopmodules/tosic_sexycontent/';
  }
}
