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
import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';

@Injectable()
export class LoadIconsService {
  private icons: Dictionary<string> = {
    apple,
    appleFilled,
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
