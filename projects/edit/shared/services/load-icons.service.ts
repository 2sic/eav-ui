import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import appleFilled from '!raw-loader!../../assets/icons/2sxc/Material-Icon-Adam-48-filled.svg';
import apple from '!raw-loader!../../assets/icons/2sxc/Material-Icon-Adam-48.svg';
import draftBranch from '!raw-loader!../../assets/icons/font-awesome/draft-branch.svg';
import fileArchive from '!raw-loader!../../assets/icons/font-awesome/file-archive.svg';
import fileAudio from '!raw-loader!../../assets/icons/font-awesome/file-audio.svg';
import fileCode from '!raw-loader!../../assets/icons/font-awesome/file-code.svg';
import fileExcel from '!raw-loader!../../assets/icons/font-awesome/file-excel.svg';
import fileImage from '!raw-loader!../../assets/icons/font-awesome/file-image.svg';
import filePdf from '!raw-loader!../../assets/icons/font-awesome/file-pdf.svg';
import filePowerpoint from '!raw-loader!../../assets/icons/font-awesome/file-powerpoint.svg';
import fileText from '!raw-loader!../../assets/icons/font-awesome/file-text.svg';
import fileVideo from '!raw-loader!../../assets/icons/font-awesome/file-video.svg';
import fileWord from '!raw-loader!../../assets/icons/font-awesome/file-word.svg';
import file from '!raw-loader!../../assets/icons/font-awesome/file.svg';
import folderPlus from '!raw-loader!../../assets/icons/font-awesome/folder-plus.svg';
import folder from '!raw-loader!../../assets/icons/font-awesome/folder.svg';
import sitemap from '!raw-loader!../../assets/icons/font-awesome/sitemap.svg';

@Injectable()
export class LoadIconsService {
  private icons = [
    { name: 'apple', html: apple },
    { name: 'appleFilled', html: appleFilled },
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

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) { }

  load() {
    this.icons.forEach(icon => {
      this.matIconRegistry.addSvgIconLiteral(
        icon.name,
        this.domSanitizer.bypassSecurityTrustHtml(icon.html),
      );
    });
  }
}
