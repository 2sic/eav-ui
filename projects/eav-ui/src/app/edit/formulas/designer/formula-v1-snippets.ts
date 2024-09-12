import { DesignerSnippet, FieldOption } from '../../dialog/footer/formula-designer/formula-designer.models';
import { FormulaVersions } from '../formula-definitions';
import { FormulaCacheItem } from '../cache/formula-cache.model';
import { FormulaRunOneHelpersFactory } from '../formula-run-one-helpers.factory';

export class FormulaV1Helpers {

  /**
   * Used to build the designer snippets context for use in formulas.
   * @param formula
   * @returns Designer snippets context for use in formulas
   */
  static buildDesignerSnippetsContext(formula: FormulaCacheItem): DesignerSnippet[] {
    switch (formula.version) {
      case FormulaVersions.V1:
        const snippets = [
          'app.appId',
          'app.zoneId',
          'app.isGlobal',
          'app.isSite',
          'app.isContent',
          'cache.ChangeThis',
          'culture.code',
          'culture.name',
          'debug',
          'features.isEnabled(\'nameId\')',
          'form.runFormulas()',
          'sxc.ChangeThis',
          'target.entity.id',
          'target.entity.guid',
          'target.name',
          'target.type',
          'user.id',
          'user.isAnonymous',
          'user.isSiteAdmin',
          'user.isSystemAdmin',
        ].map(name => {
          const code = `context.${name}`;
          const fieldSnippet: DesignerSnippet = {
            code,
            label: code,
          };
          return fieldSnippet;
        });
        return snippets;
      default:
        return;
    }
  }

  /**
   * Used to build the designer snippets for use in formulas.
   * @param formula
   * @param fieldOptions
   * @param itemHeader
   * @returns Designer snippets for use in formulas
   */
  static getSnippets(formula: FormulaCacheItem, fieldOptions: FieldOption[], prefillAsParameters: Record<string, unknown>): DesignerSnippet[] {
    switch (formula.version) {
      case FormulaVersions.V1:
        const formulaPropsParameters = FormulaRunOneHelpersFactory.buildFormulaPropsParameters(prefillAsParameters);
        const snippets = [
          'value',
          'default',
          'prefill',
          'initial',
          ...fieldOptions.map(f => f.fieldName),
          'parameters.ChangeThis',
          ...Object.keys(formulaPropsParameters).map(key => `parameters.${key}`),
        ].map(name => {
          const code = `data.${name}`;
          const fieldSnippet: DesignerSnippet = {
            code,
            label: code,
          };
          return fieldSnippet;
        });
        return snippets;
      default:
        return;
    }
  }
}