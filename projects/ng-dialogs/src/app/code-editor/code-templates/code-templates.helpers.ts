import { FileAsset } from '../models/file-asset.model';
import { TreeItem } from '../models/tree-item.model';
import { appSharedRoot } from './code-templates.models';

export function calculateTreeAppShared(templates: FileAsset[]): TreeItem[] {
  const tree: TreeItem[] = [
    {
      depth: -1,
      name: 'App Files',
      pathFromRoot: appSharedRoot,
      isShared: false,
      isFolder: true,
      children: calculateTree(templates.filter(f => !f.Shared)),
    },
    {
      depth: -1,
      name: 'Shared App Files',
      pathFromRoot: appSharedRoot,
      isShared: true,
      isFolder: true,
      children: calculateTree(templates.filter(f => f.Shared)),
    },
  ];
  return tree;
}

function calculateTree(templates: FileAsset[]): TreeItem[] {
  if (!templates) { return []; }

  const tree: TreeItem[] = [];
  for (const template of templates) {
    let parent: TreeItem[] = tree;
    const paths = template.Path.split('/');
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
          isShared: template.Shared,
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
