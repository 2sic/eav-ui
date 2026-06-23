export interface GroupHeader {
  Index: number;
  Id: number;
  Guid: string;
  Title: string;
  Type: string;
  // 2026-06-22 2dm removed, doesn't seem to be in use, must have been a test
  // TypeWip: {
  //   Name: string;
  //   Id: string;
  // }
}
