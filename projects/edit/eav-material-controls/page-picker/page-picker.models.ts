export interface PagePickerTemplateVars {
  filterText: string;
  filteredSearch: PageSearchItem[];
  tree: PageTreeItem[];
}

export interface PageSearchItem {
  id: number;
  name: string;
}

export interface PageTreeItem {
  children: PageTreeItem[];
  id: number;
  name: string;
  parentId: number;
}
