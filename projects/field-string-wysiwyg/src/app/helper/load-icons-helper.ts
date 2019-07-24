// 2sxc icons
import contentBlock from '!raw-loader!../../../../../src/icons/2sxc/content-block.svg';
// font-awesome icons
import anchor from '!raw-loader!../../../../../src/icons/font-awesome/anchor.svg';
import file from '!raw-loader!../../../../../src/icons/font-awesome/file.svg';
import filePdf from '!raw-loader!../../../../../src/icons/font-awesome/file-pdf.svg';
import sitemap from '!raw-loader!../../../../../src/icons/font-awesome/sitemap.svg';
// google material icons
import school from '!raw-loader!../../../../../src/icons/google-material/baseline-school-24px.svg';

const customTinyMceIcons = {
  'custom-anchor': anchor,
  'custom-content-block': contentBlock,
  'custom-file': file,
  'custom-file-pdf': filePdf,
  'custom-school': school,
  'custom-sitemap': sitemap,
};

export const loadCustomIcons = (editor) => {
  Object.keys(customTinyMceIcons).forEach(key => {
    if (!customTinyMceIcons.hasOwnProperty(key)) { return; }

    editor.ui.registry.addIcon(
      key,
      customTinyMceIcons[key]
    );
  });
};
