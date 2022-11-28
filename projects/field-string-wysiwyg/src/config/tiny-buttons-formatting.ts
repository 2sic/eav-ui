import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';

export class TinyButtonsTemplate extends TinyButtonsBase {
  constructor(makerParams: ButtonsMakerParams) {
      super(makerParams);
  }

  register(): void {
    throw new Error('Method not implemented.');
  }

}
