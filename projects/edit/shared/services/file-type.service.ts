import { Injectable } from '@angular/core';
import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';

@Injectable()
export class FileTypeService {
  private defaultIcon = 'file';
  private checkImgRegEx = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i;
  private customExtensions: Dictionary<string> = {
    doc: 'file-word',
    docx: 'file-word',
    xls: 'file-excel',
    xlsx: 'file-excel',
    ppt: 'file-powerpoint',
    pptx: 'file-powerpoint',
    pdf: 'file-pdf',
    mp3: 'file-audio',
    avi: 'file-video',
    mpg: 'file-video',
    mpeg: 'file-video',
    mov: 'file-video',
    mp4: 'file-video',
    zip: 'file-archive',
    rar: 'file-archive',
    txt: 'file-text',
    html: 'file-code',
    css: 'file-code',
    xml: 'file-code',
    xsl: 'file-code',
  };

  private matExtensions: Dictionary<string> = {
    vcf: 'person',
  };

  constructor() { }

  getExtension(filename: string) {
    return filename.substring(filename.lastIndexOf('.') + 1).toLocaleLowerCase();
  }

  getIconClass(filename: string) {
    const ext = this.getExtension(filename);
    return this.matExtensions[ext] || this.customExtensions[ext] || this.defaultIcon;
  }

  isKnownType(filename: string) {
    return this.matExtensions[this.getExtension(filename)] != null;
  }

  isImage(filename: string) {
    return this.checkImgRegEx.test(filename);
  }
}
