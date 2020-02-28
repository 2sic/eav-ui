import { ValueGetterParams, ICellRendererParams } from '@ag-grid-community/all-modules';

import { ContentItem } from '../../models/content-item.model';
import { PubMeta } from '../../../../shared/ag-grid-filters/pub-meta-filter/pub-meta-filter.model';
import { ExtendedColDef } from '../../models/extended-col-def.model';

export function cellRendererId(params: ICellRendererParams) {
  const item: ContentItem = params.data;
  return `
    <div title="Id: ${item.Id}\nRepoId: ${item._RepositoryId}\nGuid: ${item.Guid}">
      ${item.Id}
    </div>
  `;
}

export function valueGetterStatus(params: ValueGetterParams) {
  const item: ContentItem = params.data;
  const published: PubMeta = {
    published: item.IsPublished,
    metadata: !!item.Metadata,
  };
  return published;
}

export function cellRendererStatus(params: ICellRendererParams) {
  const item: ContentItem = params.data;
  // spm something about data.DraftEntity and data.PublishedEntity is missing. Search in eav-ui project
  return `
    <div class="icon-container">
      <i class="material-icons help" title="${item.IsPublished ? 'Published' : 'Not published'}">
        ${item.IsPublished ? 'visibility' : 'visibility_off'}
      </i>
      ${item.Metadata
      ? `
      &nbsp;
      <i class="material-icons help" title="${
      'Metadata'
      + `\nType: ${item.Metadata.TargetType}`
      + (item.Metadata.KeyNumber ? `\nNumber: ${item.Metadata.KeyNumber}` : '')
      + (item.Metadata.KeyString ? `\nString: ${item.Metadata.KeyString}` : '')
      + (item.Metadata.KeyGuid ? `\nGuid: ${item.Metadata.KeyGuid}` : '')
      }">local_offer</i>
      `
      : ''}
    </div>
  `;
}

export const actionsTemplate = `
  <div class="icon-container">
    <i class="material-icons pointer almost-implemented" action="clone" title="Clone">file_copy</i>
    &nbsp;
    <i class="material-icons pointer" action="export" title="Export">cloud_download</i>
    &nbsp;
    <i class="material-icons pointer" action="delete" title="Delete">delete</i>
  </div>
`;

export function valueGetterEntityField(params: ValueGetterParams) {
  const rawValue: ContentItem[] = params.data[params.colDef.field];
  if (rawValue.length === 0) { return null; }
  return rawValue.map(item => item.Title);
}

// htmlencode strings (source: http://stackoverflow.com/a/7124052)
function htmlEncode(text: string) {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function cellRendererEntity(params: ICellRendererParams) {
  if (!Array.isArray(params.value)) { return null; }

  const encodedValue = htmlEncode(params.value.join(', '));
  const result = `
    <span title="${encodedValue}">
      ${(<ExtendedColDef>params.colDef).allowMultiValue ? `<span class="more-entities">${params.value.length}</span>` : ''}
      ${encodedValue}
    </span>
  `;
  return result;
}

export function valueGetterDateTime(params: ValueGetterParams) {
  const rawValue: string = params.data[params.colDef.field];
  if (!rawValue) { return null; }

  // remove 'Z' and replace 'T'
  // spm Replace substr with substring (https://stackoverflow.com/questions/3745515/what-is-the-difference-between-substr-and-substring)
  return (<ExtendedColDef>params.colDef).useTimePicker ? rawValue.substr(0, 19).replace('T', ' ') : rawValue.substr(0, 10);
}

export function valueGetterBoolean(params: ValueGetterParams) {
  const rawValue = params.data[params.colDef.field];
  if (typeof rawValue !== 'boolean') { return null; }
  return rawValue.toString();
}
