import { DropdownOption } from '../../../../../../../../edit-types';

/**
 * For String-Picker field - will prepare settings (usually in the form of multiline-CSV)
 * and convert them to options, for further use in the picker. 
 */
export function calculateDropdownOptions(
  currentValue: string,
  type: 'string' | 'number',
  dropdownValuesFormat: '' | 'value-label', // firs one is empty as a compatibility with old 2sxc versions
  dropdownValues: string
): DropdownOption[] {
  let options: DropdownOption[] = [];

  if (dropdownValues) {
    const dropdownValuesArray = dropdownValues.replace(/\r/g, '').split('\n');

    switch (dropdownValuesFormat) {
      case '':
        options = dropdownValuesArray.map(e => {
          const s = e.split(':');
          const maybeWantedEmptyVal = s[1];
          const key = s.shift();
          const val = s.join(':');
          const option: DropdownOption = {
            label: key,
            value: (val || maybeWantedEmptyVal === '') ? val : key
          };
          return option;
        });
        break;
      case 'value-label':
        options = dropdownValuesArray.map(valueLabel => {
          // remove backslash escapes
          const chars: { char: string, escaped: boolean }[] = [];
          for (let i = 0; i < valueLabel.length; i++) {
            const current = valueLabel[i];
            const next = valueLabel[i + 1];

            if (current === '\\' && next != null) {
              chars.push({ char: next, escaped: true });
              i++;
              continue;
            }

            chars.push({ char: current, escaped: false });
          }

          // dropdownValues split with ":", but ignore if escaped
          const separatorIndex = chars.findIndex(c => c.char === ':' && c.escaped === false);
          const option: DropdownOption = {
            label: separatorIndex >= 0
              ? chars.slice(separatorIndex + 1, chars.length).map(c => c.char).join('')
              : chars.map(c => c.char).join(''),
            value: separatorIndex >= 0
              ? chars.slice(0, separatorIndex).map(c => c.char).join('')
              : chars.map(c => c.char).join(''),
          };
          if (type === 'number') {
            option.value = option.value != null && option.value !== ''
              ? !isNaN(Number(option.value)) ? Number(option.value) : null
              : null;
          }
          return option;
        });
        break;
    }
  }

  const currentValueFound = options.some(o => o.value === currentValue);
  if (!currentValueFound && !currentValue && currentValue !== '') {
    options.push({
      label: currentValue,
      value: currentValue,
    });
  }
  return options;
}
