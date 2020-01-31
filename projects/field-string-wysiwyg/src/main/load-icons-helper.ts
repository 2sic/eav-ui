// 2sxc icons
import * as contentBlock from '../../../edit/assets/icons/2sxc/content-block.svg';
import * as fileDnn from '../../../edit/assets/icons/2sxc/file-dnn.svg';
import * as imageDnn from '../../../edit/assets/icons/2sxc/image-dnn.svg';
import * as imageH1 from '../../../edit/assets/icons/2sxc/H1.svg';
import * as imageH2 from '../../../edit/assets/icons/2sxc/H2.svg';
import * as imageH3 from '../../../edit/assets/icons/2sxc/H3.svg';
import * as imageH4 from '../../../edit/assets/icons/2sxc/H4.svg';
import * as imageH5 from '../../../edit/assets/icons/2sxc/H5.svg';
import * as imageH6 from '../../../edit/assets/icons/2sxc/H6.svg';
import * as imageU1 from '../../../edit/assets/icons/2sxc/U1.svg';
import * as imageU2 from '../../../edit/assets/icons/2sxc/U2.svg';
import * as imageU3 from '../../../edit/assets/icons/2sxc/U3.svg';
import * as imageU4 from '../../../edit/assets/icons/2sxc/U4.svg';
import * as imageU5 from '../../../edit/assets/icons/2sxc/U5.svg';
import * as imageU6 from '../../../edit/assets/icons/2sxc/U6.svg';
// font-awesome icons
import * as anchor from '../../../edit/assets/icons/font-awesome/anchor.svg';
import * as file from '../../../edit/assets/icons/font-awesome/file.svg';
import * as filePdf from '../../../edit/assets/icons/font-awesome/file-pdf.svg';
import * as sitemap from '../../../edit/assets/icons/font-awesome/sitemap.svg';
// google material icons
import * as school from '../../../edit/assets/icons/google-material/baseline-school-24px.svg';

const customTinyMceIcons: any = {
  'custom-anchor': anchor,
  'custom-content-block': contentBlock,
  'custom-file': file,
  'custom-file-dnn': fileDnn,
  'custom-file-pdf': filePdf,
  'custom-image-dnn': imageDnn,
  'custom-image-h1': imageH1,
  'custom-image-h2': imageH2,
  'custom-image-h3': imageH3,
  'custom-image-h4': imageH4,
  'custom-image-h5': imageH5,
  'custom-image-h6': imageH6,
  'custom-image-u1': imageU1,
  'custom-image-u2': imageU2,
  'custom-image-u3': imageU3,
  'custom-image-u4': imageU4,
  'custom-image-u5': imageU5,
  'custom-image-u6': imageU6,
  'custom-school': school,
  'custom-sitemap': sitemap,
};

export function loadCustomIcons(editor: any) {
  Object.keys(customTinyMceIcons).forEach(key => {
    if (!customTinyMceIcons.hasOwnProperty(key)) { return; }

    editor.ui.registry.addIcon(
      key,
      customTinyMceIcons[key]
    );
  });
}
