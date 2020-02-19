export interface EavConstants {
  metadata: {
    [key: string]: {
      type: number;
      target: string;
    }
  };
  keyTypes: {
    [key: string]: string;
  };
  contentType: {
    [key: string]: string;
  };
}
