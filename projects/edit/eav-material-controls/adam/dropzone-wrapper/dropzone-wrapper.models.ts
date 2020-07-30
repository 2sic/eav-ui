import { DropzoneConfigExt } from '../../../../edit-types';

export class DropzoneConfigInstance implements DropzoneConfigExt {
  /** Subfolder and UsePortalRoot are updated from AdamBrowser */
  disabled: boolean;
  url: string;
  headers: any;
  acceptedFiles: string = null;
  maxFiles = 1000;
  parallelUploads = 1000;
  autoReset: number = null;
  errorReset: number = null;
  cancelReset: number = null;
  /** In MB. Upload will also be stopped on the server if file is larger than allowed */
  maxFilesize = 10000;
  paramName = 'uploadfile';
  maxThumbnailFilesize = 10;
  dictDefaultMessage = '';
  addRemoveLinks = false;
  previewsContainer = '.dropzone-previews';
  /**
   * We need a clickable, because otherwise the entire area is clickable,
   * so i'm just making the preview clickable, as it's not important
   */
  clickable = '.dropzone-previews';

  constructor(disabled: boolean, url: string, headers: any) {
    this.disabled = disabled;
    this.url = url;
    this.headers = headers;
  }
}
