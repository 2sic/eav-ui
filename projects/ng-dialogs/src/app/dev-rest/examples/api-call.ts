import { CodeSample } from './code-sample';

export class ApiCall {
  constructor(
    public virtual: boolean,
    public verb: 'GET' | 'POST' | 'DELETE',
    public url: string,
    public teaser: string,
    public instructions: string,
    public enableButton: boolean,
    public code: CodeSample[] = [],
    public browseUrl: string = null,
    ) {}
}
