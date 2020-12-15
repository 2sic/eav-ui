import { CellClassParams, CellClickedEvent, ICellRendererParams, ValueGetterParams } from '@ag-grid-community/all-modules';
import { ViewUsageData, ViewUsageDataStatus } from '../../models/view-usage-data.model';

export function blockIdValueGetter(params: ValueGetterParams) {
  const data: ViewUsageData = params.data;
  return `ID: ${data.Block.Id}\nGUID: ${data.Block.Guid}`;
}

export function moduleIdValueGetter(params: ValueGetterParams) {
  const data: ViewUsageData = params.data;
  if (data.Module == null) { return; }
  return `ID: ${data.Module.Id}\nUsageId: ${data.Module.UsageId}\nTitle: ${data.Module.Title}`;
}

export function moduleIdClassGetter(params: CellClassParams) {
  if (params.value == null) { return 'no-outline'; }
  return 'id-action no-padding no-outline';
}

export function pageIdValueGetter(params: ValueGetterParams) {
  const data: ViewUsageData = params.data;
  if (data.PageId == null) { return; }
  return `ID: ${data.PageId}`;
}

export function pageIdClassGetter(params: CellClassParams) {
  if (params.value == null) { return 'no-outline'; }
  return 'id-action no-padding no-outline';
}

export function nameClassGetter(params: CellClassParams) {
  if (params.value == null) { return 'no-outline'; }
  return 'primary-action highlight';
}

export function onNameClicked(params: CellClickedEvent) {
  if (params.value == null) { return; }
  const data: ViewUsageData = params.data;
  window.open(data.Url, '_blank');
}

export function statusCellRenderer(params: ICellRendererParams) {
  const status: ViewUsageDataStatus = params.value;
  if (status == null) { return; }
  return `
    <div style="height: 100%;display: flex;align-items: center;">
      ${status.IsVisible ? '<span class="material-icons-outlined">visibility</span>' : '<span class="material-icons-outlined">visibility_off</span>'}
      ${status.IsDeleted ? '<span style="margin-left: 8px;" class="material-icons-outlined">delete</span>' : ''}
    </div>
  `;
}
