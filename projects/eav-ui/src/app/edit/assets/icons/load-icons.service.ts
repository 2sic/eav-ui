import appleFilled from '!raw-loader!./2sxc/Material-Icon-Adam-48-filled.svg';
import appleOutlined from '!raw-loader!./2sxc/Material-Icon-Adam-48-outlined.svg';
import draftBranch from '!raw-loader!./font-awesome/draft-branch.svg';
import fileArchive from '!raw-loader!./font-awesome/file-archive.svg';
import fileAudio from '!raw-loader!./font-awesome/file-audio.svg';
import fileCode from '!raw-loader!./font-awesome/file-code.svg';
import fileExcel from '!raw-loader!./font-awesome/file-excel.svg';
import fileImage from '!raw-loader!./font-awesome/file-image.svg';
import filePdf from '!raw-loader!./font-awesome/file-pdf.svg';
import filePowerpoint from '!raw-loader!./font-awesome/file-powerpoint.svg';
import fileText from '!raw-loader!./font-awesome/file-text.svg';
import fileVideo from '!raw-loader!./font-awesome/file-video.svg';
import fileWord from '!raw-loader!./font-awesome/file-word.svg';
import file from '!raw-loader!./font-awesome/file.svg';
import folderPlus from '!raw-loader!./font-awesome/folder-plus.svg';
import folder from '!raw-loader!./font-awesome/folder.svg';
import sitemap from '!raw-loader!./font-awesome/sitemap.svg';
import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

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
