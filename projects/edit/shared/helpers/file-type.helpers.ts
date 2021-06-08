export class FileTypeHelpers {
  private static defaultIcon = 'file';
  private static customExtensions: Record<string, string> = {
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
  private static matExtensions: Record<string, string> = {
    vcf: 'person',
  };

  static getExtension(filename: string) {
    return filename.substring(filename.lastIndexOf('.') + 1).toLocaleLowerCase();
  }

  static getIconClass(filename: string) {
    const ext = this.getExtension(filename);
    return this.matExtensions[ext] || this.customExtensions[ext] || this.defaultIcon;
  }

  static isKnownType(filename: string) {
    return this.matExtensions[this.getExtension(filename)] != null;
  }

  static isImage(filename: string) {
    return this.isImgRegex().test(filename);
  }

  private static isImgRegex() {
    return /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/i;
  }
}
