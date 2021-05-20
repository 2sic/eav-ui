import { Component, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { copyToClipboard } from '../../../../ng-dialogs/src/app/shared/helpers/copy-to-clipboard.helper';
import { FormulaHelpers } from '../../../shared/helpers';
import { DesignerState, FormulaTarget, FormulaTargets } from '../../../shared/models';
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

  constructor(private formulaDesignerService: FormulaDesignerService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadError = false;
    if (this.itemEditFormRefs == null) {
      this.loadError = true;
      return;
    }
    this.formulaDesignerService.setDesignerOpen(true);
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
    const newState: DesignerState = {
      ...this.formulaDesignerService.getDesignerState(),
    };
    switch (target) {
      case SelectTargets.Entity:
        newState.entityGuid = value;
        newState.fieldName = this.fieldOptions[value]?.[0]?.fieldName;
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

    const oldState = this.formulaDesignerService.getDesignerState();
    if (oldState.entityGuid == null && oldState.fieldName == null && oldState.target == null) {
      const newState: DesignerState = {
        ...oldState,
        entityGuid: this.entityOptions[0]?.entityGuid,
        fieldName: this.fieldOptions[this.entityOptions[0]?.entityGuid]?.[0]?.fieldName,
        target: this.FormulaTargets.Value,
      };
      this.formulaDesignerService.setDesignerState(newState);
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
    const designerState$ = this.formulaDesignerService.getDesignerState$();
    const formula$ = designerState$.pipe(
      mergeMap(designer =>
        this.formulaDesignerService.getFormula$(designer.entityGuid, designer.fieldName, designer.target, true)
      ),
    );
    const snippets$ = formula$.pipe(
      map(formula => formula != null ? FormulaHelpers.buildDesignerSnippets(formula, this.fieldOptions[formula.entityGuid]) : []),
    );
    const result$ = designerState$.pipe(
      mergeMap(designer =>
        this.formulaDesignerService.getFormulaResult$(designer.entityGuid, designer.fieldName, designer.target)
      ),
    );

    this.templateVars$ = combineLatest([hasFormula$, formula$, snippets$, designerState$, result$]).pipe(
      map(([hasFormula, formula, snippets, designer, result]) => {
        const templateVars: FormulaDesignerTemplateVars = {
          formula,
          hasFormula,
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
