import { FormLanguage } from '../form/form-languages.model';
import { EavDimension } from '../shared/models/eav';


export class DimensionReader {
  constructor(private dimensions: EavDimension[], private language: FormLanguage) { }

  get hasCurrentWrite(): boolean {
    const match = this.dimensions.find(d => d.Value === this.language.current
      || (this.language.current === this.language.primary && d.Value === '*'));
    return !!match;
  }

  get hasCurrentReadOnly(): boolean {
    const currentRO = `~${this.language.current}`;
    return this.dimensions.find(d => d.Value === currentRO) !== undefined;
  }

  get hasCurrent(): boolean {
    const match = this.dimensions.find(d => d.Value === this.language.current
      || d.Value === `~${this.language.current}`
      || (this.language.current === this.language.primary && d.Value === '*'));
    return !!match;
  }
}
