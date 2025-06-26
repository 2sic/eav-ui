import { FormLanguage } from '../form/form-languages.model';
import { EavDimension } from '../shared/models/eav';


export class DimensionReader {
  constructor(private dimensions: EavDimension[], private language: FormLanguage) { }

  get hasCurrentWrite(): boolean {
    const match = this.dimensions.find(d => d.dimCode === this.language.current
      || (this.language.current === this.language.primary && d.dimCode === '*'));
    return !!match;
  }

  get hasCurrentReadOnly(): boolean {
    const currentRO = `~${this.language.current}`;
    return this.dimensions.find(d => d.dimCode === currentRO) !== undefined;
  }

  get hasCurrent(): boolean {
    const match = this.dimensions.find(d => d.dimCode === this.language.current
      || d.dimCode === `~${this.language.current}`
      || (this.language.current === this.language.primary && d.dimCode === '*'));
    return !!match;
  }
}
