import { DropzoneConfigExt } from './DropzoneConfigExt';

export interface Dropzone {
  /**
   * Takes full or partial Dropzone configuration and calculates new values
   */
  setConfig(config: Partial<DropzoneConfigExt>): void;
  /**
   * Returns a snapshot of Dropzone configuration
   */
  getConfig(): DropzoneConfigExt;
  /**
   * Uploads image using Dropzone
   */
  uploadFile(file: File): void;
}
