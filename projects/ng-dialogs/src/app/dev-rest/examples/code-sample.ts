import { Hint } from './hint';

export class CodeSample {
  constructor(
    public title: string,
    public description: string,
    public code: string,
    public runInConsole: boolean,
    public hints: Hint[] = [],
    // public warning = '',
  ) {
    // the code often has a leading new-line - so we'll trim this
    this.code = this.code.trim();
  }
}
