import * as filePdf from '../../../edit/assets/icons/font-awesome/file-pdf.svg';
import * as file from '../../../edit/assets/icons/font-awesome/file.svg';
import * as sitemap from '../../../edit/assets/icons/font-awesome/sitemap.svg';
import { Dictionary } from '../../../ng-dialogs/src/app/shared/models/dictionary.model';
import * as contentBlock from '../assets/icons/2sxc/content-block.svg';
import * as fileDnn from '../assets/icons/2sxc/file-dnn.svg';
import * as imageH1 from '../assets/icons/2sxc/H1.svg';
import * as imageH2 from '../assets/icons/2sxc/H2.svg';
import * as imageH3 from '../assets/icons/2sxc/H3.svg';
import * as imageH4 from '../assets/icons/2sxc/H4.svg';
import * as imageH5 from '../assets/icons/2sxc/H5.svg';
import * as imageH6 from '../assets/icons/2sxc/H6.svg';
import * as imageDnn from '../assets/icons/2sxc/image-dnn.svg';
import * as imageU1 from '../assets/icons/2sxc/U1.svg';
import * as imageU2 from '../assets/icons/2sxc/U2.svg';
import * as imageU3 from '../assets/icons/2sxc/U3.svg';
import * as imageU4 from '../assets/icons/2sxc/U4.svg';
import * as imageU5 from '../assets/icons/2sxc/U5.svg';
import * as imageU6 from '../assets/icons/2sxc/U6.svg';
import * as anchor from '../assets/icons/font-awesome/anchor.svg';
import * as school from '../assets/icons/google-material/baseline-school-24px.svg';
import * as paragraph from '../assets/icons/tinymce/paragraph.svg';
import { TinyType } from '../shared/models';

const customTinyMceIcons: Dictionary<string> = {
  'custom-anchor': anchor.default,
  'custom-content-block': contentBlock.default,
  'custom-file': file.default,
  'custom-file-dnn': fileDnn.default,
  'custom-file-pdf': filePdf.default,
  'custom-image-dnn': imageDnn.default,
  'custom-image-h1': imageH1.default,
  'custom-image-h2': imageH2.default,
  'custom-image-h3': imageH3.default,
  'custom-image-h4': imageH4.default,
  'custom-image-h5': imageH5.default,
  'custom-image-h6': imageH6.default,
  'custom-image-u1': imageU1.default,
  'custom-image-u2': imageU2.default,
  'custom-image-u3': imageU3.default,
  'custom-image-u4': imageU4.default,
  'custom-image-u5': imageU5.default,
  'custom-image-u6': imageU6.default,
  'custom-school': school.default,
  'custom-sitemap': sitemap.default,
  'custom-paragraph': paragraph.default,
};

export function loadCustomIcons(editor: TinyType) {
  Object.entries(customTinyMceIcons).forEach(([name, svg]) => {
    editor.ui.registry.addIcon(name, svg);
  });
}
