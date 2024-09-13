import { classLog } from '../../shared/logging';
import { getVersion } from '../../shared/signals/signal.utilities';
import { FieldConstantsOfLanguage, FieldProps } from '../state/fields-configs.model';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FormulaRunPicker, FormulaRunPickers } from './run/formula-objects-internal-data';
import { FormulaSpecialPickerTargets } from './targets/formula-targets';

const logSpecs = {
  all: false,
  filterFormulasIfPickerNotReady: false,
}

export class FormulaRunFieldPickerHelper {
  
  log = classLog({FormulaRunFieldPickerHelper});

  constructor(private fieldName: string, private fieldConstants: FieldConstantsOfLanguage, private propsBefore: FieldProps) {
    this.isSpecialPicker = fieldConstants.inputTypeSpecs.isNewPicker
  }

  isSpecialPicker: boolean;

  get infos() { return this.#infos ??= this.#getInfos(this.fieldName, this.fieldConstants, this.propsBefore); }
  #infos: FormulaRunPickers;

  filterFormulasIfPickerNotReady(enabled: FormulaCacheItem[]) {
    const l = this.log.fnIfInList('filterFormulasIfPickerNotReady', 'fields', this.fieldName);
    const picks = this.infos;
    const formulas = this.isSpecialPicker && !picks.ready
      ? enabled.filter(f => !FormulaSpecialPickerTargets.includes(f.target))
      : enabled
    const msg = `🧪📊formulas:${formulas.length}; pickerChanged: ${picks.changed}; opts: ${picks.options.changed}/${picks.options.ver}; sel: ${picks.selected.changed}/${picks.selected.ver}`;
    return l.rSilent(formulas, msg);
  }

  #getInfos(fieldName: string, fieldConstants: FieldConstantsOfLanguage, propsBefore: FieldProps): FormulaRunPickers {
    const l = this.log.fnIfInList('getPickerInfos', 'fields', fieldName);
    // Get the latest picker data and check if it has changed - as it affects which formulas to run
    const picker = fieldConstants.pickerData();
    if (picker?.ready() != true) {
      const dummy = { list: [], listRaw: [], ver: null, verBefore: null, changed: false, } as FormulaRunPicker;
      return { ready: false, mapper: null, picker, options: dummy, selected: dummy, changed: false, };
    }

    function getSpecs(cache: typeof picker.optionsRaw, final: typeof picker.optionsRaw, verBefore: number): FormulaRunPicker {
      const listRaw = cache(); // must access before version check
      const ver = getVersion(cache);
      return { list: final(), listRaw, ver, verBefore, changed: ver !== verBefore, } satisfies FormulaRunPicker;
    }
    const options = getSpecs(picker.optionsRaw, picker.optionsFinal, propsBefore.opts?.ver);
    const selected = getSpecs(picker.selectedRaw, picker.selectedAll, propsBefore.sel?.ver);

    const result: FormulaRunPickers = {
      ready: true,
      mapper: picker.state.mapper,
      picker,
      options,
      selected,
      changed: selected.changed || options.changed,
    };
    return l.r(result);
  }

}