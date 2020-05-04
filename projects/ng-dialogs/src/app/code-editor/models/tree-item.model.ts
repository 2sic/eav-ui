export interface TreeItem {
  name: string;
  children: TreeItem[];
  pathFromRoot: string;
}
