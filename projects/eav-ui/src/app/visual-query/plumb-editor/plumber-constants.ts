
export const DataSrcIdPrefix = 'dataSource_';
export const EndpointLabelName = 'endpointLabel';

export function domIdOfGuid(guid: string): string {
  return DataSrcIdPrefix + guid;
}

export function guidOfDomId(domId: string): string {
  return domId.replace(DataSrcIdPrefix, '');
}