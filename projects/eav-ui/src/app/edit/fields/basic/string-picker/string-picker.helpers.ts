import { PickerOptionCustom } from '../../../../../../../edit-types/src/DropdownOption';
import { classLog } from '../../../../shared/logging/logging';

const logSpecs = {
  all: true,
  calculateDropdownOptions: true,
  addSelectedIfMissing: true,
}

export class DataSourceDropDownOptions {
  log = classLog({DataSourceDropDownOptions}, logSpecs);

  constructor() { }

  parseOptions(
    currentValue: string | number | null,
    type: 'string' | 'number',
    dropdownValuesFormat: '' | 'value-label', // first one is empty as a compatibility with old 2sxc versions
    dropdownValues: string
  ): PickerOptionCustom[] {
    const l = this.log.fn('calculateDropdownOptions', { currentValue, type, dropdownValuesFormat, dropdownValues });

    if (!dropdownValues)
      return l.r(this.addSelectedIfMissing([], currentValue), 'No dropdownValues');
  
    const lines = dropdownValues
      .replace(/\r/g, '')
      .split('\n');
  
    switch (dropdownValuesFormat) {
      case '':
        const classicOptions = lines.map(line => {
          const s = line.split(':');
          const maybeWantedEmptyVal = s[1];
          const key = s.shift();    // first element is the key; remove it
          const val = s.join(':');  // in case there are more than one colon, we'll join them back
          return {
            Title: key,
            Value: (val || maybeWantedEmptyVal === '') ? val : key
          } satisfies PickerOptionCustom;
        });
        return l.r(this.addSelectedIfMissing(classicOptions, currentValue));
  
      // Newer format, where the value is the first part, and the label is the rest
      // Numbers can only be in this format, as we added the number-dropdowns later
      case 'value-label':
        const options = lines.map(line => {
          // remove backslash escapes
          const chars: { char: string, escaped: boolean }[] = [];
          for (let i = 0; i < line.length; i++) {
            const current = line[i];
            const next = line[i + 1];
  
            if (current === '\\' && next != null) {
              chars.push({ char: next, escaped: true });
              i++;
              continue;
            }
  
            chars.push({ char: current, escaped: false });
          }
  
          // dropdownValues split with ":", but ignore if escaped
          const separatorIndex = chars.findIndex(c => c.char === ':' && c.escaped === false);
          const option: PickerOptionCustom = {
            Title: separatorIndex >= 0
              ? chars.slice(separatorIndex + 1, chars.length).map(c => c.char).join('')
              : chars.map(c => c.char).join(''),
            Value: separatorIndex >= 0
              ? chars.slice(0, separatorIndex).map(c => c.char).join('')
              : chars.map(c => c.char).join(''),
          };
          if (type === 'number') {
            option.Value = option.Value != null && option.Value !== ''
              ? !isNaN(Number(option.Value)) ? Number(option.Value) : null
              : null;
          }
          return option;
        });
        return l.r(this.addSelectedIfMissing(options, currentValue));
    }
  }

  addSelectedIfMissing(options: PickerOptionCustom[], currentValue: string | number | null): PickerOptionCustom[] {
    const l = this.log.fn('addSelectedIfMissing', { options, currentValue });

    if (currentValue == null || currentValue === '')
      return l.r(options, 'currentValue is null');
    
    // Perform string-compare because we don't know if the currentValue is a number or a string
    const currentString = currentValue.toString();
    const currentValueFound = options.some(o => o.Value?.toString() === currentString);
    if (currentValueFound)
      return l.r(options, 'found');

    // 2024-12-17 2dm - this condition doesn't seem to make sense, so turn it off until we
    // understand when we would need it
    // if (!currentValueFound && !currentValue && currentValue !== '') {
      return l.r([
        ...options,
        {
          Title: currentString,
          Value: currentValue,
        } 
      ]);
    // }
    // return l.r(options);
  }
}
