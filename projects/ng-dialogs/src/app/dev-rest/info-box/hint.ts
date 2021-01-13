// tslint:disable: curly

export type infoBoxType = 'alert' | 'info' | 'tip' | 'warning';

export const infoBoxIconMap: { [name in infoBoxType]: string } = {
  alert: 'warning',
  info: 'menu_book',
  tip: 'star',
  warning: 'warning',
};

export class Hint {
  public icon: string;
  constructor(
    public type: infoBoxType,
    public message: string,
    public link: string = '',
  ) {
    this.icon = infoBoxIconMap[type];
  }
}
