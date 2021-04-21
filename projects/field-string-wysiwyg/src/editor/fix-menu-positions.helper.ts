import { FieldStringWysiwygEditor } from './editor';

export function fixMenuPositions(fieldStringWysiwyg: FieldStringWysiwygEditor): MutationObserver {
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      for (const addedNode of Array.from(mutation.addedNodes) as HTMLElement[]) {
        if (!addedNode.classList) { continue; }
        if (!addedNode.classList.contains('tox-menu')) { continue; }

        const toxMenu = addedNode;
        const containerPaddingTopBottom = 10;
        const containerPaddingSides = 0;
        const containerOffsets = fieldStringWysiwyg.getBoundingClientRect();
        const containerTop = containerOffsets.top + containerPaddingTopBottom;
        const containerLeft = containerOffsets.left + containerPaddingSides;
        const containerBottom = containerOffsets.bottom - containerPaddingTopBottom;
        const containerRight = containerOffsets.right - containerPaddingSides;
        const containerHeight = containerOffsets.height - 2 * containerPaddingTopBottom;
        const containerWidth = containerOffsets.width - 2 * containerPaddingSides;

        let toxMenuOffsets = toxMenu.getBoundingClientRect();
        let menuTop = toxMenuOffsets.top;
        let menuLeft = toxMenuOffsets.left;
        let menuBottom = toxMenuOffsets.bottom;
        let menuRight = toxMenuOffsets.right;
        let menuHeight = toxMenuOffsets.height;
        let menuWidth = toxMenuOffsets.width;

        // fix height
        if (menuHeight > containerHeight) {
          toxMenu.style.maxHeight = `${containerHeight}px`;
          toxMenuOffsets = toxMenu.getBoundingClientRect();
          menuTop = toxMenuOffsets.top;
          menuLeft = toxMenuOffsets.left;
          menuBottom = toxMenuOffsets.bottom;
          menuRight = toxMenuOffsets.right;
          menuHeight = toxMenuOffsets.height;
          menuWidth = toxMenuOffsets.width;
        }

        if (menuTop < containerTop) {
          // fix too far top
          const oldBottomStyle = parseInt(toxMenu.style.bottom, 10);
          const newBottomStyle = oldBottomStyle - (containerTop - menuTop);
          toxMenu.style.bottom = `${newBottomStyle}px`;
        } else if (menuBottom > containerBottom) {
          // fix too far bottom
          const oldTopStyle = parseInt(toxMenu.style.top, 10);
          const newTopStyle = oldTopStyle - (menuBottom - containerBottom);
          toxMenu.style.top = `${newTopStyle}px`;
        }

        if (menuWidth > containerWidth) {
          // fix too wide
          toxMenu.style.width = `${containerWidth}px`;
          toxMenuOffsets = toxMenu.getBoundingClientRect();
          menuTop = toxMenuOffsets.top;
          menuLeft = toxMenuOffsets.left;
          menuBottom = toxMenuOffsets.bottom;
          menuRight = toxMenuOffsets.right;
          menuHeight = toxMenuOffsets.height;
          menuWidth = toxMenuOffsets.width;
        }
        if (menuRight > containerRight) {
          // fix too far right
          const oldLeftStyle = parseInt(toxMenu.style.left, 10);
          const newLeftStyle = oldLeftStyle - (menuRight - containerRight);
          toxMenu.style.left = `${newLeftStyle}px`;
        } else if (menuLeft < containerLeft) {
          // fix too far left
          const oldRightStyle = parseInt(toxMenu.style.right, 10);
          const newRightStyle = oldRightStyle - (containerLeft - menuLeft);
          toxMenu.style.right = `${newRightStyle}px`;
        }

        toxMenu.style.visibility = 'visible';
      }
    }
  });
  const toolbarContainer = fieldStringWysiwyg.querySelector('.tinymce-toolbar-container');
  observer.observe(toolbarContainer, { subtree: true, childList: true });
  return observer;
}
