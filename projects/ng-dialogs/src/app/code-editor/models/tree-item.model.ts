export interface TreeItem {
  depth: number;
  name: string;
  pathFromRoot: string;
  isFolder: boolean;
  /** Only folder can have children */
  children?: TreeItem[];
}
