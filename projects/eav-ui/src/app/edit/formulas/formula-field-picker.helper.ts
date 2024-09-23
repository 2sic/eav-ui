import { classLog, FnLogger } from '../../shared/logging';
import { getVersion } from '../../shared/signals/signal.utilities';
import { DebugFields } from '../edit-debug';
import { FieldConstantsOfLanguage, FieldProps } from '../state/fields-configs.model';
import { FormulaCacheItem } from './cache/formula-cache.model';
import { FieldFormulasResultPartialSettings, FieldFormulasResultRaw } from './results/formula-results.models';
import { FormulaRunPicker, FormulaRunPickers } from './run/formula-objects-internal-data';
import { FormulaSpecialPickerAutoSleep, FormulaSpecialPickerTargets } from './targets/formula-targets';

const logSpecs = {
  all: false,
  getPickerInfos: false,
  filterFormulasIfPickerNotReady: true,
  fields: [...DebugFields],
}

export class FormulaFieldPickerHelper {
  
  log = classLog({FormulaFieldPickerHelper}, logSpecs);

  constructor(private fieldName: string, private fieldConstants: FieldConstantsOfLanguage, private propsBefore: FieldProps) {
    this.isSpecialPicker = fieldConstants.inputTypeSpecs.isNewPicker
  }

  isSpecialPicker: boolean;

  get infos() { return this.#infos ??= this.#getInfos(this.fieldName, this.fieldConstants, this.propsBefore); }
  #infos: FormulaRunPickers;

  //#endregion Prepare / Get Picker Infos / Select live formulas

  /**
   * Filter out formulas which should not run yet, for these reasons:
   * 1. picker is not ready
   * 2. picker is ready but nothing has changed, and "sleep" determines that in this case it shouldn't run.
   */
  public filterFormulasIfPickerNotReady(before: FormulaCacheItem[]) {
    const l = this.log.fnIfInList('filterFormulasIfPickerNotReady', 'fields', this.fieldName, { before });
    const picks = this.infos;

    const ready = this.isSpecialPicker && !picks.ready
      ? before.filter(f => !f.fieldIsSpecialPicker)
      : before; 
      
    // Figure out which picker-formulas must sleep
    const formulas = ready.filter(f => !f.fieldIsSpecialPicker || (this.isSpecialPicker && !f.sleep || picks.changed));

    const msg = `🧪📊 before: ${before.length}; ready: ${ready.length}; formulas:${formulas.length}; pickerChanged: ${picks.changed}; opts: ${picks.options.changed}/${picks.options.ver}; sel: ${picks.selected.changed}/${picks.selected.ver}`;
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
    const options = getSpecs(picker.optionsRaw, picker.optionsAll, propsBefore.opts?.ver);
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

  //#endregion

  //#region Update Field Props

  /**
   * Pause depends on explicit result
   */
  public updateFormulaSleep(formula: FormulaCacheItem, raw: FieldFormulasResultRaw, l: FnLogger): void {
    formula.sleep = raw.sleep ?? (FormulaSpecialPickerAutoSleep.includes(formula.target) ? true : formula.sleep);
    l.a(`🧪⏸️formula.sleep: ${formula.target}; formula.sleep: ${formula.sleep}; raw.sleep: ${raw.sleep}`);
  }

  /**
   * Transfer options with version if result contains anything like that.
   */
  public preserveResultsAfterRun(formula: FormulaCacheItem, wip: FieldFormulasResultPartialSettings, raw: FieldFormulasResultRaw, l: FnLogger): FieldFormulasResultPartialSettings {

    // picker data results - experimental v18
    if (raw.options) {
      wip.options = { list: raw.options, ver: this.infos.options.ver };
      l.a(`🧪📃 options returned, will add`, wip.options as unknown as Record<string, unknown>);
    }

    if (raw.selected) {
      wip.selected = { list: raw.selected, ver: this.infos.selected.ver };
      l.a(`🧪📃 selected returned, will add`, wip.selected as unknown as Record<string, unknown>);
    }

    return wip;
  }

  //#endregion

}