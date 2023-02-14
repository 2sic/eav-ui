import { DropzoneConfigExt } from './DropzoneConfigExt';
import { Observable } from 'rxjs';

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
   * Returns a stream (an observable) of Dropzone configuration
   */
  getConfig$(): Observable<DropzoneConfigExt>;
  /**
   * Uploads image using Dropzone
   */
  uploadFile(file: File): void;
}
