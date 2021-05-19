import { TreeItem } from '../models/tree-item.model';

export function calculateTree(templates: string[]): TreeItem[] {
  if (!templates) { return []; }

  const tree: TreeItem[] = [];
  for (const template of templates) {
    let parent: TreeItem[] = tree;
    const paths = template.split('/');
    const last = paths[paths.length - 1];
    let pathFromRoot = '';
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      pathFromRoot += i ? `/${path}` : path;
      const existing = parent.find(item => item.name === path);
      if (existing) {
        parent = existing.children;
      } else {
        const item: TreeItem = {
          depth: i,
          name: path,
          pathFromRoot,
          isFolder: path !== last,
          ...(path !== last && { children: [] }),
        };
        parent.push(item);
        parent = item.children;
      }
    }
  }

  return tree;
}
