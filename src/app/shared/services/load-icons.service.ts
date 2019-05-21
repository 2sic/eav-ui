import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import apple from '!raw-loader!../../../icons/2sxc/Material-Icon-Adam-48-filled.svg';
import draftBranch from '!raw-loader!../../../icons/font-awesome/draft-branch.svg';
import file from '!raw-loader!../../../icons/font-awesome/file.svg';
import fileArchive from '!raw-loader!../../../icons/font-awesome/file-archive.svg';
import fileAudio from '!raw-loader!../../../icons/font-awesome/file-audio.svg';
import fileCode from '!raw-loader!../../../icons/font-awesome/file-code.svg';
import fileExcel from '!raw-loader!../../../icons/font-awesome/file-excel.svg';
import fileImage from '!raw-loader!../../../icons/font-awesome/file-image.svg';
import filePdf from '!raw-loader!../../../icons/font-awesome/file-pdf.svg';
import filePowerpoint from '!raw-loader!../../../icons/font-awesome/file-powerpoint.svg';
import fileText from '!raw-loader!../../../icons/font-awesome/file-text.svg';
import fileVideo from '!raw-loader!../../../icons/font-awesome/file-video.svg';
import fileWord from '!raw-loader!../../../icons/font-awesome/file-word.svg';
import folder from '!raw-loader!../../../icons/font-awesome/folder.svg';
import folderPlus from '!raw-loader!../../../icons/font-awesome/folder-plus.svg';
import sitemap from '!raw-loader!../../../icons/font-awesome/sitemap.svg';

@Injectable({
  providedIn: 'root'
})
export class LoadIconsService {
  private icons = [
    { name: 'apple', html: apple },
    { name: 'draft-branch', html: draftBranch },
    { name: 'file', html: file },
    { name: 'file-archive', html: fileArchive },
    { name: 'file-audio', html: fileAudio },
    { name: 'file-code', html: fileCode },
    { name: 'file-excel', html: fileExcel },
    { name: 'file-image', html: fileImage },
    { name: 'file-pdf', html: filePdf },
    { name: 'file-powerpoint', html: filePowerpoint },
    { name: 'file-text', html: fileText },
    { name: 'file-video', html: fileVideo },
    { name: 'file-word', html: fileWord },
    { name: 'folder', html: folder },
    { name: 'folder-plus', html: folderPlus },
    { name: 'sitemap', html: sitemap },
  ];

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) { }

  load() {
    this.icons.forEach(icon => {
      this.matIconRegistry.addSvgIconLiteral(
        icon.name,
        this.domSanitizer.bypassSecurityTrustHtml(icon.html),
      );
    });
  }
}
