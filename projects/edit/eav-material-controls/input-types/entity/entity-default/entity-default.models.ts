export interface SelectedEntity {
  value: string;
  label: string;
  tooltip: string;
  isFreeTextOrNotFound: boolean;
}

export interface DeleteEntityProps {
  index: number;
  entityGuid: string;
}
