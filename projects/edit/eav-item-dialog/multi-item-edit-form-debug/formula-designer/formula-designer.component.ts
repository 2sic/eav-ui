import { Component, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { copyToClipboard } from '../../../../ng-dialogs/src/app/shared/helpers/copy-to-clipboard.helper';
import { FormulaHelpers } from '../../../shared/helpers';
import { DesignerState, FormulaTarget, FormulaTargets } from '../../../shared/models';
import { FormulaDesignerService } from '../../../shared/services';
import { ItemEditFormComponent } from '../../item-edit-form/item-edit-form.component';
import { defaultFormula } from './formula-designer.constants';
// tslint:disable-next-line:max-line-length
import { DesignerSnippet, EntityOption, FieldOption, FieldOptions, FormulaDesignerTemplateVars, SelectTarget, SelectTargets, TargetOption, TargetOptions } from './formula-designer.models';

@Component({
  selector: 'app-formula-designer',
  templateUrl: './formula-designer.component.html',
  styleUrls: ['./formula-designer.component.scss'],
})
export class FormulaDesignerComponent implements OnInit, OnDestroy {
  @Input() private itemEditFormRefs: QueryList<ItemEditFormComponent>;

  FormulaTargets = FormulaTargets;
  SelectTargets = SelectTargets;
  loadError = false;
  freeTextTarget = false;
  templateVars$: Observable<FormulaDesignerTemplateVars>;

  constructor(private formulaDesignerService: FormulaDesignerService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadError = false;
    if (this.itemEditFormRefs == null) {
      this.loadError = true;
      return;
    }
    this.formulaDesignerService.setDesignerOpen(true);
    this.buildTemplateVars();
  }

  ngOnDestroy(): void {
    this.formulaDesignerService.setDesignerOpen(false);
  }

  trackEntityOptions(index: number, entityOption: EntityOption): string {
    return entityOption.entityGuid;
  }

  trackFieldOptions(index: number, fieldOption: FieldOption): string {
    return fieldOption.fieldName;
  }

  trackSnippets(index: number, snippet: DesignerSnippet): string {
    return snippet.code;
  }

  selectedChanged(target: SelectTarget, value: string | FormulaTarget, fieldOptions: FieldOptions): void {
    const newState: DesignerState = {
      ...this.formulaDesignerService.getDesignerState(),
    };
    switch (target) {
      case SelectTargets.Entity:
        newState.entityGuid = value;
        newState.fieldName = fieldOptions[value]?.[0]?.fieldName;
        break;
      case SelectTargets.Field:
        newState.fieldName = value;
        break;
      case SelectTargets.Target:
        newState.target = value as FormulaTarget;
        break;
    }

    this.formulaDesignerService.setDesignerState(newState);
  }

  formulaChanged(formula: string): void {
    const designer = this.formulaDesignerService.getDesignerState();
    this.formulaDesignerService.upsertFormula(designer.entityGuid, designer.fieldName, designer.target, formula, false);
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  toggleEdit(): void {
    const oldState = this.formulaDesignerService.getDesignerState();
    const designer: DesignerState = {
      ...oldState,
      editMode: !oldState.editMode,
    };
    this.formulaDesignerService.setDesignerState(designer);
    if (designer.editMode) {
      const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
      if (formula == null) {
        this.formulaDesignerService.upsertFormula(designer.entityGuid, designer.fieldName, designer.target, defaultFormula, false);
      }
    }
  }

  reset(): void {
    const designer: DesignerState = {
      ...this.formulaDesignerService.getDesignerState(),
      editMode: false,
    };
    this.formulaDesignerService.setDesignerState(designer);
    this.formulaDesignerService.resetFormula(designer.entityGuid, designer.fieldName, designer.target);
    this.itemEditFormRefs.find(itemEditFormRef => itemEditFormRef.entityGuid === designer.entityGuid)
      .fieldsSettingsService.forceSettings();
  }

  run(): void {
    const designer = this.formulaDesignerService.getDesignerState();
    const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
    this.formulaDesignerService.upsertFormula(designer.entityGuid, designer.fieldName, designer.target, formula.source, true);
    this.itemEditFormRefs.find(itemEditFormRef => itemEditFormRef.entityGuid === designer.entityGuid)
      .fieldsSettingsService.forceSettings();
  }

  openFormulasHelp(): void {
    window.open('https://r.2sxc.org/functions', '_blank');
  }

  private buildTemplateVars(): void {
    const options$ = combineLatest([
      this.formulaDesignerService.getDesignerState$(),
      this.formulaDesignerService.getFormulas$()
    ]).pipe(
      map(([designer, formulas]) => {
        const entityOptions = this.itemEditFormRefs.map(itemEditFormRef => {
          const entityGuid = itemEditFormRef.entityGuid;
          const entity: EntityOption = {
            entityGuid,
            hasFormula: formulas.some(f => f.entityGuid === entityGuid),
            label: itemEditFormRef.fieldsSettingsService.getContentTypeSettings()._itemTitle,
          };
          return entity;
        });

        const fieldOptions: FieldOptions = {};
        this.itemEditFormRefs.forEach(itemEditFormRef => {
          const entityGuid = itemEditFormRef.entityGuid;
          const fields = Object.keys(itemEditFormRef.fieldsSettingsService.getFieldsProps()).map(fieldName => {
            const field: FieldOption = {
              fieldName,
              hasFormula: formulas.some(f => f.entityGuid === entityGuid && f.fieldName === fieldName),
              label: fieldName,
            };
            return field;
          });
          fieldOptions[entityGuid] = fields;
        });

        const targetOptions: TargetOptions = {};
        this.itemEditFormRefs.forEach(itemEditFormRef => {
          const entityGuid = itemEditFormRef.entityGuid;
          if (targetOptions[entityGuid] == null) {
            targetOptions[entityGuid] = {};
          }
          const fieldNames = Object.keys(itemEditFormRef.fieldsSettingsService.getFieldsProps());
          fieldNames.forEach(fieldName => {
            const formulasForThisField = formulas.filter(f => f.entityGuid === entityGuid && f.fieldName === fieldName);
            const defaultTargets = Object.values(FormulaTargets).map(target => {
              const targetOption: TargetOption = {
                hasFormula: formulas.some(f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === target),
                label: target.substring(target.lastIndexOf('.') + 1),
                target,
              };
              return targetOption;
            });
            const otherTargets = formulasForThisField.map(formula => {
              const existsInDefault = defaultTargets.some(t => t.target === formula.target);
              if (existsInDefault) { return; }
              const targetOption: TargetOption = {
                hasFormula: true,
                label: formula.target.substring(formula.target.lastIndexOf('.') + 1),
                target: formula.target,
              };
              return targetOption;
            }).filter(t => !!t);

            const merged = [...defaultTargets, ...otherTargets];
            if (designer.entityGuid != null && designer.fieldName != null && designer.target != null) {
              if (!merged.some(t => t.target === designer.target)) {
                const targetOption: TargetOption = {
                  hasFormula: formulas.some(f => f.entityGuid === entityGuid && f.fieldName === fieldName && f.target === designer.target),
                  label: designer.target.substring(designer.target.lastIndexOf('.') + 1),
                  target: designer.target,
                };
                merged.push(targetOption);
              }
            }
            targetOptions[itemEditFormRef.entityGuid][fieldName] = merged;
          });
        });

        return { entityOptions, fieldOptions, targetOptions };
      }),
      tap(options => {
        const oldState = this.formulaDesignerService.getDesignerState();
        if (oldState.entityGuid == null && oldState.fieldName == null && oldState.target == null) {
          const newState: DesignerState = {
            ...oldState,
            entityGuid: options.entityOptions[0]?.entityGuid,
            fieldName: options.fieldOptions[options.entityOptions[0]?.entityGuid]?.[0]?.fieldName,
            target: this.FormulaTargets.Value,
          };
          this.formulaDesignerService.setDesignerState(newState);
        }
      }),
    );
    const designerState$ = this.formulaDesignerService.getDesignerState$();
    const formula$ = designerState$.pipe(
      mergeMap(designer =>
        this.formulaDesignerService.getFormula$(designer.entityGuid, designer.fieldName, designer.target, true)
      ),
    );
    const snippets$ = combineLatest([options$, formula$]).pipe(
      map(([options, formula]) => formula != null
        ? FormulaHelpers.buildDesignerSnippets(formula, options.fieldOptions[formula.entityGuid])
        : []
      ),
    );
    const result$ = designerState$.pipe(
      mergeMap(designer =>
        this.formulaDesignerService.getFormulaResult$(designer.entityGuid, designer.fieldName, designer.target)
      ),
    );

    this.templateVars$ = combineLatest([options$, formula$, snippets$, designerState$, result$]).pipe(
      map(([options, formula, snippets, designer, result]) => {
        const templateVars: FormulaDesignerTemplateVars = {
          entityOptions: options.entityOptions,
          fieldOptions: options.fieldOptions,
          targetOptions: options.targetOptions,
          formula,
          designer,
          snippets,
          result: result?.value,
          resultIsError: result?.isError ?? false,
        };
        return templateVars;
      }),
    );
  }
}
