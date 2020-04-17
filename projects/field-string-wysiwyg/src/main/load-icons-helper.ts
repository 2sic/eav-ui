// TODO: SPM - shouldn't we move these files into this folder?
// I assume they are not actually shared with any other code


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
// tinymce icons
import * as paragraph from '../../../edit/assets/icons/tinymce/paragraph.svg';

const customTinyMceIcons: { [key: string]: string } = {
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

export function loadCustomIcons(editor: any) {
  Object.keys(customTinyMceIcons).forEach(key => {
    if (!customTinyMceIcons.hasOwnProperty(key)) { return; }

    editor.ui.registry.addIcon(
      key,
      customTinyMceIcons[key]
    );
  });
}
