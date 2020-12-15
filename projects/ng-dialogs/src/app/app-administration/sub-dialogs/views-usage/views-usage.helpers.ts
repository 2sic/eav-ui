import { ViewUsageData } from '../../models/view-usage-data.model';
import { ViewUsage } from '../../models/view-usage.model';

export function buildData(viewUsage: ViewUsage) {
  const data: ViewUsageData[] = [];
  for (const block of viewUsage.Blocks) {
    if (block.Modules.length === 0) {
      data.push({
        Block: { Id: block.Id, Guid: block.Guid },
      });
    }
    for (const module of block.Modules) {
      data.push({
        Block: { Id: block.Id, Guid: block.Guid },
        Module: module,
        PageId: module.Page.Id,
        Name: module.Page.Name,
        Url: module.Page.Url,
        Language: module.Page.CultureCode,
        Status: { IsVisible: module.Page.Visible, IsDeleted: module.IsDeleted },
      });
    }
  }
  return data;
}
