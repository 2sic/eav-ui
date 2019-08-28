// 2sxc icons
import * as contentBlock from '../../../../src/icons/2sxc/content-block.svg';
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
  'custom-file-pdf': filePdf,
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
