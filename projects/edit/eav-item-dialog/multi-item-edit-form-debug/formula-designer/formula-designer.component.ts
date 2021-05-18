import { Component, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { copyToClipboard } from '../../../../ng-dialogs/src/app/shared/helpers/copy-to-clipboard.helper';
import { FormulaHelpers } from '../../../shared/helpers';
import { ActiveDesigner, FormulaTarget, FormulaTargets } from '../../../shared/models';
import { FormulaDesignerService } from '../../../shared/services';
import { ItemEditFormComponent } from '../../item-edit-form/item-edit-form.component';
import { defaultFormula } from './formula-designer.constants';
import { DesignerSnippet, EntityOption, FieldOption, FormulaDesignerTemplateVars, HasFormula, SelectTarget, SelectTargets } from './formula-designer.models';

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
  entityOptions: EntityOption[];
  fieldOptions: Record<string, FieldOption[]>;
  templateVars$: Observable<FormulaDesignerTemplateVars>;

  private editMode$: BehaviorSubject<boolean>;

  constructor(private formulaDesignerService: FormulaDesignerService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadError = false;
    if (this.itemEditFormRefs == null) {
      this.loadError = true;
      return;
    }
    this.formulaDesignerService.setDesignerOpen(true);
    this.editMode$ = new BehaviorSubject(false);
    this.buildOptions();
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

  selectedChanged(target: SelectTarget, value: string | FormulaTarget): void {
    const selected = this.formulaDesignerService.getActiveDesigner();
    const newSelected: ActiveDesigner = { ...selected };
    switch (target) {
      case SelectTargets.Entity:
        newSelected.entityGuid = value;
        newSelected.fieldName = this.fieldOptions[value]?.[0]?.fieldName;
        break;
      case SelectTargets.Field:
        newSelected.fieldName = value;
        break;
      case SelectTargets.Target:
        newSelected.target = value as FormulaTarget;
        break;
    }

    this.formulaDesignerService.setActiveDesigner(newSelected);
  }

  formulaChanged(formula: string): void {
    const selected = this.formulaDesignerService.getActiveDesigner();
    this.formulaDesignerService.upsertFormula(selected.entityGuid, selected.fieldName, selected.target, formula, false);
  }

  copyToClipboard(text: string): void {
    copyToClipboard(text);
    this.snackBar.open('Copied to clipboard', null, { duration: 2000 });
  }

  toggleEdit(): void {
    this.editMode$.next(!this.editMode$.value);
    if (this.editMode$.value) {
      const selected = this.formulaDesignerService.getActiveDesigner();
      const formula = this.formulaDesignerService.getFormula(selected.entityGuid, selected.fieldName, selected.target, true);
      if (formula == null) {
        this.formulaDesignerService.upsertFormula(selected.entityGuid, selected.fieldName, selected.target, defaultFormula, false);
      }
    }
  }

  reset(): void {
    this.editMode$.next(false);
    const selected = this.formulaDesignerService.getActiveDesigner();
    this.formulaDesignerService.resetFormula(selected.entityGuid, selected.fieldName, selected.target);
  }

  run(): void {
    const selected = this.formulaDesignerService.getActiveDesigner();
    const formula = this.formulaDesignerService.getFormula(selected.entityGuid, selected.fieldName, selected.target, true);
    this.formulaDesignerService.upsertFormula(selected.entityGuid, selected.fieldName, selected.target, formula.source, true);
    this.itemEditFormRefs.find(itemEditFormRef => itemEditFormRef.entityGuid === selected.entityGuid)
      .fieldsSettingsService.forceSettings();
  }

  openFormulasHelp(): void {
    window.open('https://r.2sxc.org/functions', '_blank');
  }

  private buildOptions(): void {
    this.entityOptions = this.itemEditFormRefs.map(itemEditFormRef => {
      const entity: EntityOption = {
        entityGuid: itemEditFormRef.entityGuid,
        label: itemEditFormRef.fieldsSettingsService.getContentTypeSettings()._itemTitle,
      };
      return entity;
    });

    this.fieldOptions = this.itemEditFormRefs.reduce((acc, itemEditFormRef) => {
      const fields = Object.keys(itemEditFormRef.fieldsSettingsService.getFieldsProps()).map(fieldName => {
        const field: FieldOption = {
          fieldName,
          label: fieldName,
        };
        return field;
      });
      acc[itemEditFormRef.entityGuid] = fields;
      return acc;
    }, {} as Record<string, FieldOption[]>);

    const activeDesigner = this.formulaDesignerService.getActiveDesigner();
    if (activeDesigner == null) {
      const newSelected: ActiveDesigner = {
        entityGuid: this.entityOptions[0]?.entityGuid,
        fieldName: this.fieldOptions[this.entityOptions[0]?.entityGuid]?.[0]?.fieldName,
        target: this.FormulaTargets.Value,
      };
      this.formulaDesignerService.setActiveDesigner(newSelected);
    }
  }

  private buildTemplateVars(): void {
    const hasFormula$ = this.formulaDesignerService.getFormulas$().pipe(
      map(formulas => {
        const hasFormula: HasFormula = {};
        for (const formula of formulas) {
          if (hasFormula[formula.entityGuid] == null) {
            hasFormula[formula.entityGuid] = {};
          }
          if (hasFormula[formula.entityGuid][formula.fieldName] == null) {
            hasFormula[formula.entityGuid][formula.fieldName] = {};
          }
          hasFormula[formula.entityGuid][formula.fieldName][formula.target] = true;
        }
        return hasFormula;
      }),
    );
    const activeDesigner$ = this.formulaDesignerService.getActiveDesigner$();
    const formula$ = activeDesigner$.pipe(
      mergeMap(activeDesigner =>
        this.formulaDesignerService.getFormula$(activeDesigner.entityGuid, activeDesigner.fieldName, activeDesigner.target, true)
      ),
    );
    const snippets$ = formula$.pipe(
      map(formula => formula != null ? FormulaHelpers.buildDesignerSnippets(formula, this.fieldOptions[formula.entityGuid]) : []),
    );
    const result$ = activeDesigner$.pipe(
      mergeMap(activeDesigner =>
        this.formulaDesignerService.getFormulaResult$(activeDesigner.entityGuid, activeDesigner.fieldName, activeDesigner.target)
      ),
      map(result => result?.isError ? 'Calculation failed. Please check logs for more info' : result?.value),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([this.editMode$, hasFormula$, formula$, snippets$, activeDesigner$, result$]).pipe(
      map(([editMode, hasFormula, formula, snippets, activeDesigner, result]) => {
        const templateVars: FormulaDesignerTemplateVars = {
          editMode,
          formula,
          hasFormula,
          selected: activeDesigner,
          snippets,
          result,
        };
        return templateVars;
      }),
    );
  }
}
