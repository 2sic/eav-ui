export interface EntityFilterModel {
  filterType: 'entity';
  filter: string | undefined | null;
  idFilter: number[] | undefined | null;
}
