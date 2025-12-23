import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import appleFilled from './2sxc/Material-Icon-Adam-48-filled.svg';
import appleOutlined from './2sxc/Material-Icon-Adam-48-outlined.svg';
import draftBranch from './font-awesome/draft-branch.svg';
import fileArchive from './font-awesome/file-archive.svg';
import fileAudio from './font-awesome/file-audio.svg';
import fileCode from './font-awesome/file-code.svg';
import fileExcel from './font-awesome/file-excel.svg';
import fileImage from './font-awesome/file-image.svg';
import filePdf from './font-awesome/file-pdf.svg';
import filePowerpoint from './font-awesome/file-powerpoint.svg';
import fileText from './font-awesome/file-text.svg';
import fileVideo from './font-awesome/file-video.svg';
import fileWord from './font-awesome/file-word.svg';
import file from './font-awesome/file.svg';
import folderPlus from './font-awesome/folder-plus.svg';
import folder from './font-awesome/folder.svg';
import sitemap from './font-awesome/sitemap.svg';

@Injectable()
export class LoadIconsService {
  private icons: Record<string, string> = {
    'apple-filled': appleFilled,
    'apple-outlined': appleOutlined,
    'draft-branch': draftBranch,
    file,
    'file-archive': fileArchive,
    'file-audio': fileAudio,
    'file-code': fileCode,
    'file-excel': fileExcel,
    'file-image': fileImage,
    'file-pdf': filePdf,
    'file-powerpoint': filePowerpoint,
    'file-text': fileText,
    'file-video': fileVideo,
    'file-word': fileWord,
    folder,
    'folder-plus': folderPlus,
    sitemap,
  };

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) { }

  load() {
    Object.entries(this.icons).forEach(([name, svg]) => {
      this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml(svg));
    });
  }
}
