import { ColDef } from '@ag-grid-community/core';

export interface RelationshipRow {
  id: number;
  guid: string;
  title: string;
  field: string;
  isChild: boolean;
  contentTypeName: string;
}

export interface RelationshipColDef extends ColDef<RelationshipRow> {
  isTitleLink?: boolean;
}