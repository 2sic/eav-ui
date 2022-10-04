export type InfoBoxType = 'alert' | 'info' | 'tip' | 'warning';

export const infoBoxIconMap: { [name in InfoBoxType]: string } = {
  alert: 'warning',
  info: 'menu-book',
  tip: 'star',
  warning: 'warning',
};

export class Hint {
  public icon: string;

  constructor(public type: InfoBoxType, public message: string, public link = '') {
    this.icon = infoBoxIconMap[type];
  }
}
