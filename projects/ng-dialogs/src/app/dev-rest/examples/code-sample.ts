export class CodeSample {
  constructor(
    public title: string,
    public description: string,
    public code: string,
    public wrap = false,
    public runInConsole = false) {
  }
}
