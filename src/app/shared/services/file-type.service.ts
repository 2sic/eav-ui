import { Injectable } from '@angular/core';

@Injectable()
export class FileTypeService {

  constructor() { }

  private iconPrefix = 'eav-icon-';
  private defaultIcon = 'file';
  private checkImgRegEx = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i;
  private extensions = {
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
    vcf: 'user'
  };

  public getExtension = (filename) => {
    return filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  public getIconClass = (filename) => {
    return this.iconPrefix + (this.extensions[this.getExtension(filename)] || this.defaultIcon);
  }

  public isKnownType = (filename) => {
    return this.extensions[this.getExtension(filename)] !== undefined;
  }

  public isImage = (filename) => {
    return this.checkImgRegEx.test(filename);
  }
}
