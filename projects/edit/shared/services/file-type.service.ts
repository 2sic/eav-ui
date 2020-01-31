import { Injectable } from '@angular/core';

@Injectable()
export class FileTypeService {

  constructor() { }

  private defaultIcon = 'file';
  private checkImgRegEx = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i;
  private customExtensions: { [key: string]: string } = {
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

  private matExtensions: { [key: string]: string } = {
    vcf: 'person',
  };

  public getExtension = (filename: string) => {
    return filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
  }

  public getIconClass = (filename: string) => {
    const ext = this.getExtension(filename);
    return this.matExtensions[ext]
      || this.customExtensions[ext]
      || this.defaultIcon;
  }

  public isKnownType = (filename: string) => {
    return this.matExtensions[this.getExtension(filename)] !== undefined;
  }

  public isImage = (filename: string) => {
    return this.checkImgRegEx.test(filename);
  }
}
