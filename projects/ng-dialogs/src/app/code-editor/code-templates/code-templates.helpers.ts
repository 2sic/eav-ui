import { TreeItem } from '../models/tree-item.model';

export function calculateTree(templates: string[]): TreeItem[] {
  if (!templates) { return []; }

  const tree: TreeItem[] = [];
  for (const template of templates) {
    let parent: TreeItem[] = tree;
    const paths = template.split('/');
    const last = paths[paths.length - 1];
    for (const path of paths) {
      const existing = parent.find(item => item.name === path);
      if (existing) {
        parent = existing.children;
      } else {
        const item: TreeItem = {
          name: path,
          children: (path !== last) ? [] : null,
          pathFromRoot: template,
        };
        parent.push(item);
        parent = item.children;
      }
    }
  }

  return tree;
}

export function calculateOpenItems(filename: string, tree: TreeItem[]): TreeItem[] {
  if (!filename || !tree) { return []; }

  const openItems: TreeItem[] = [];
  const paths = filename.split('/');
  let parent = tree;
  for (const path of paths) {
    const existing = parent.find(item => item.name === path);
    if (!existing) { break; }
    openItems.push(existing);
    if (!existing.children) { break; }
    parent = existing.children;
  }

  return openItems;
}

export function toggleInArray(item: TreeItem, array: TreeItem[]) {
  const index = array.indexOf(item);
  if (index === -1) {
    array.push(item);
  } else {
    array.splice(index, 1);
  }
}
