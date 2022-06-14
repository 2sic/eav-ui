export const DialogTypeConstants = {
  Zone: 'zone',
  Apps: 'apps',
  AppImport: 'app-import',
  App: 'app',
  ContentType: 'contenttype',
  ContentItems: 'contentitems',
  Edit: 'edit',
  ItemHistory: 'item-history',
  Develop: 'develop',
  PipelineDesigner: 'pipeline-designer',
  Replace: 'replace',
  InstanceList: 'instance-list',
} as const;

export type DialogTypeConstant = typeof DialogTypeConstants[keyof typeof DialogTypeConstants];
