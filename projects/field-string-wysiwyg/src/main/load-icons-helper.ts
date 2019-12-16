// 2sxc icons
import * as contentBlock from '../../../../src/icons/2sxc/content-block.svg';
import * as fileDnn from '../../../../src/icons/2sxc/file-dnn.svg';
import * as imageDnn from '../../../../src/icons/2sxc/image-dnn.svg';
import * as imageH1 from '../../../../src/icons/2sxc/H1.svg';
import * as imageH2 from '../../../../src/icons/2sxc/H2.svg';
import * as imageH3 from '../../../../src/icons/2sxc/H3.svg';
import * as imageH4 from '../../../../src/icons/2sxc/H4.svg';
import * as imageH5 from '../../../../src/icons/2sxc/H5.svg';
import * as imageH6 from '../../../../src/icons/2sxc/H6.svg';
import * as imageP from '../../../../src/icons/2sxc/p.svg';
// font-awesome icons
import * as anchor from '../../../../src/icons/font-awesome/anchor.svg';
import * as file from '../../../../src/icons/font-awesome/file.svg';
import * as filePdf from '../../../../src/icons/font-awesome/file-pdf.svg';
import * as sitemap from '../../../../src/icons/font-awesome/sitemap.svg';
// google material icons
import * as school from '../../../../src/icons/google-material/baseline-school-24px.svg';

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
  'custom-image-p': imageP,
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
