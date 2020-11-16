// tslint:disable: curly

type typeName = 'alert' | 'info' | 'tip' | 'warning';
const map: { [name in typeName]: string } = {
  alert: 'warning',
  info: 'menu_book',
  tip: 'star',
  warning: 'warning',
};

export class Hint {
  public icon: string;
  constructor(
    public type: typeName,
    public message: string,
    public link: string = '',
  ) {
    this.icon = map[type];
  }
}
