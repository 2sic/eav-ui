
export const dataSrcIdPrefix = 'dataSource_';

export function domIdOfGuid(guid: string): string {
  return dataSrcIdPrefix + guid;
}

export function guidOfDomId(domId: string): string {
  return domId.replace(dataSrcIdPrefix, '');
}