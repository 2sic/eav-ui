import alignLeft from '!raw-loader!../../../../../src/icons/glyphicon-halflings/glyphicons-halflings-247-object-align-left.svg';
import alignVertical from '!raw-loader!../../../../../src/icons/glyphicon-halflings/glyphicons-halflings-248-object-align-vertical.svg';
import alignRight from '!raw-loader!../../../../../src/icons/glyphicon-halflings/glyphicons-halflings-249-object-align-right.svg';
import anchor from '!raw-loader!../../../../../src/icons/font-awesome/anchor.svg';
import contentBlock from '!raw-loader!../../../../../src/icons/2sxc/content-block.svg';
import file from '!raw-loader!../../../../../src/icons/font-awesome/file.svg';
import filePdf from '!raw-loader!../../../../../src/icons/font-awesome/file-pdf.svg';
import sitemap from '!raw-loader!../../../../../src/icons/font-awesome/sitemap.svg';

export const icons = {
  alignLeft,
  alignVertical,
  alignRight,
  anchor,
  contentBlock,
  file,
  filePdf,
  sitemap,
};

export const replaceIcon = (iconSelector, newIcon, buttonClassNames) => {
  let icon = document.querySelector(iconSelector);
  const button = icon.parentElement;
  button.removeChild(icon);
  icon = null;
  button.insertAdjacentHTML('afterbegin', newIcon);
  buttonClassNames.forEach(className => {
    button.classList.add(className);
  });
};
