export interface TreeItem {
  depth: number;
  name: string;
  pathFromRoot: string;
  isShared: boolean;
  isFolder: boolean;
  /** Only folder can have children */
  children?: TreeItem[];
}
