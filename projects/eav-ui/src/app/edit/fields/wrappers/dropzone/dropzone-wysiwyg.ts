import { WysiwygConstants } from '../../../../../../../field-string-wysiwyg/shared/wysiwyg.constants';


/**
 * Special helper / constants so Dropzone works together with the WYSIWYG editor
 */
export class DropzoneWysiwyg {

  /** If the last drop was on a WYSIWYG field */
  isStringWysiwyg = false;

  /** Allowed image / mime types on WYSIWYG */
  imageTypes: string[] = ["image/jpeg", "image/png"];

  // on onDrop we check if drop is on wysiwyg or not
  detectWysiwygOnDrop(event: any) {
    this.isStringWysiwyg = DropzoneWysiwyg.isParentWysiwyg((event.toElement as HTMLElement));
  }
  
  // here we check if file is image type so we can cancel upload if it is also uploaded on wysiwyg
  removeFilesHandledByWysiwyg(dropzone: any, file: any) {
    if (this.isStringWysiwyg && this.imageTypes.some(x => x === file.type))
      dropzone.removeFile(file);
  }


  static isParentWysiwyg(element: HTMLElement): boolean {
    // Traverse the DOM to see if we can find the wysiwyg editor
    do {
      if (element == null) return false;
      if (element?.classList.contains(WysiwygConstants.classToDetectWysiwyg)) return true;
      element = element.parentElement;
    } while (!element?.classList.contains(WysiwygConstants.classToDetectWysiwyg) || element.parentElement != document.body);
    return false;
  }

}