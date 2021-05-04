import { PageEntity, PageSearchItem, PageTreeItem } from './page-picker.models';

export function buildPageSearch(pages: PageEntity[]): PageSearchItem[] {
  if (!pages) { return []; }

  const items = pages.map(page => {
    let path = page.Path.trim().replace(/\\/g, '/').replace(/\/\//g, '/');
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    path = path.split('/').slice(0, -1).join(' > ');

    const item: PageSearchItem = {
      id: page.Id,
      name: page.Name,
      path,
    };
    return item;
  });

  return items;
}

export function buildPageTree(pages: PageEntity[]): PageTreeItem[] {
  if (!pages) { return []; }

  const items = pages.map(page => {
    const item: PageTreeItem = {
      children: [],
      id: page.Id,
      name: page.Name,
      parentId: page.ParentId,
    };
    return item;
  });

  const tree: PageTreeItem[] = [];
  const broken: PageTreeItem[] = [];
  for (const item of items) {
    if (item.parentId === -1) {
      tree.push(item);
      continue;
    }

    const parent = items.find(i => i.id === item.parentId);
    if (!parent) {
      broken.push(item);
    } else {
      parent.children.push(item);
    }
  }

  if (broken.length > 0) {
    /** Fake entry to place all pages which are missing parent */
    const item: PageTreeItem = {
      children: broken,
      id: null,
      name: 'Missing Parent',
      parentId: null,
    };
    tree.push(item);
  }

  return tree;
}
