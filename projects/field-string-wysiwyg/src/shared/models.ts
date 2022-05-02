export interface ImageFormats {
  [name: string]: {
    selector: string;
    collapsed: boolean;
    styles: {
      width: string;
    };
  }[];
}
