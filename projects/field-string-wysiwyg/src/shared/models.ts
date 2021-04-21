/** Type copied from TinyMCE because it's not exported */
export interface BlobInfo {
  id: () => string;
  name: () => string;
  filename: () => string;
  blob: () => Blob;
  base64: () => string;
  blobUri: () => string;
  uri: () => string | undefined;
}

export interface ImageFormats {
  [name: string]: {
    selector: string;
    collapsed: boolean;
    styles: {
      width: string;
    };
  }[];
}
