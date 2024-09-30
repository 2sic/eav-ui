
export interface PickerSourceBase {
  Title: string;

  ConfigModel: 'UiPickerModeTree';
}

export interface UiPickerModeTree extends PickerSourceBase {
  TreeRelationship: typeof RelationshipParentChild | typeof RelationshipChildParent; //child-parent or parent-child
  TreeBranchesStream: string;
  TreeLeavesStream: string;
  TreeParentIdField: string;
  TreeChildIdField: string;
  TreeParentChildRefField: string;
  TreeChildParentRefField: string;

  TreeShowRoot: boolean;
  TreeDepthMax: number;

  TreeAllowSelectRoot: boolean;
  TreeAllowSelectBranch: boolean;
  TreeAllowSelectLeaf: boolean;
}

export const RelationshipParentChild = 'parent-child';
export const RelationshipChildParent = 'child-parent';
