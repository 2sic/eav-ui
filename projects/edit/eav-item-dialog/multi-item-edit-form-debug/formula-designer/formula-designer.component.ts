import { Component, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { copyToClipboard } from '../../../../ng-dialogs/src/app/shared/helpers/copy-to-clipboard.helper';
import { FormulaHelpers, LocalizationHelpers } from '../../../shared/helpers';
import { DesignerState, FormulaTarget, FormulaTargets } from '../../../shared/models';
import { EavItem } from '../../../shared/models/eav';
import { Item1 } from '../../../shared/models/json-format-v1';
import { EavService, FormulaDesignerService } from '../../../shared/services';
import { ContentTypeItemService } from '../../../shared/store/ngrx-data';
import { ItemEditFormComponent } from '../../item-edit-form/item-edit-form.component';
import { SaveEavFormData } from '../../multi-item-edit-form/multi-item-edit-form.models';
import { defaultFormula } from './formula-designer.constants';
// tslint:disable-next-line:max-line-length
import { DesignerSnippet, EntityOption, FieldOption, FormulaDesignerTemplateVars, SelectOptions, SelectTarget, SelectTargets, TargetOption } from './formula-designer.models';

@Component({
  selector: 'app-formula-designer',
  templateUrl: './formula-designer.component.html',
  styleUrls: ['./formula-designer.component.scss'],
})
export class FormulaDesignerComponent implements OnInit, OnDestroy {
  @Input() private itemEditFormRefs: QueryList<ItemEditFormComponent>;

  SelectTargets = SelectTargets;
  loadError = false;
  freeTextTarget = false;
  allowSaveFormula = this.eavService.eavConfig.enableFormulaSave;
  templateVars$: Observable<FormulaDesignerTemplateVars>;

  constructor(
    private formulaDesignerService: FormulaDesignerService,
    private snackBar: MatSnackBar,
    private contentTypeItemService: ContentTypeItemService,
    private eavService: EavService,
  ) { }

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

  selectedChanged(target: SelectTarget, value: string | FormulaTarget): void {
    const newState: DesignerState = {
      ...this.formulaDesignerService.getDesignerState(),
      editMode: false,
    };
    switch (target) {
      case SelectTargets.Entity:
        newState.entityGuid = value;
        const selectedEditFormRef = this.itemEditFormRefs.find(itemEditFormRef => itemEditFormRef.entityGuid === newState.entityGuid);
        newState.fieldName = Object.keys(selectedEditFormRef.fieldsSettingsService.getFieldsProps())[0];
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

  toggleFreeText(): void {
    this.freeTextTarget = !this.freeTextTarget;
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
    this.itemEditFormRefs
      .find(itemEditFormRef => itemEditFormRef.entityGuid === designer.entityGuid)
      .fieldsSettingsService.forceSettings();
  }

  run(): void {
    const designer = this.formulaDesignerService.getDesignerState();
    const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
    this.formulaDesignerService.upsertFormula(designer.entityGuid, designer.fieldName, designer.target, formula.source, true);
    this.itemEditFormRefs
      .find(itemEditFormRef => itemEditFormRef.entityGuid === designer.entityGuid)
      .fieldsSettingsService.forceSettings();
  }

  save(): void {
    try {
      const designer = this.formulaDesignerService.getDesignerState();
      const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
      if (formula.sourceGuid == null) { return; }

      const oldFormulaItem = this.contentTypeItemService.getContentTypeItem(formula.sourceGuid);
      if (oldFormulaItem == null) { return; }

      const language = oldFormulaItem.Attributes.Formula.Values[0].Dimensions[0].Value;
      if (language == null) { return; }

      const newFormulaItem: EavItem = {
        Entity: {
          ...oldFormulaItem,
          Attributes: LocalizationHelpers.updateAttributeValue(
            oldFormulaItem.Attributes, 'Formula', formula.source, language, language, false,
          ),
        },
        Header: {
          Add: null,
          ContentTypeName: oldFormulaItem.Type.Name,
          DuplicateEntity: null,
          EntityId: oldFormulaItem.Id,
          For: null,
          Group: null,
          Guid: oldFormulaItem.Guid,
          Index: null,
          Prefill: null,
        },
      };

      const saveData: SaveEavFormData = {
        Items: [Item1.convert(newFormulaItem)],
        DraftShouldBranch: false,
        IsPublished: true,
      };
      this.eavService.saveFormData(saveData, 'false').subscribe(saveResult => {
        this.formulaDesignerService.updateSaved(designer.entityGuid, designer.fieldName, designer.target, formula.source);
        this.snackBar.open('Formula saved', null, { duration: 2000 });
      });
    } catch (error) {
      console.error(error);
      this.snackBar.open('Saving formula failed. Please check console for more info', null, { duration: 2000 });
    }
  }

  openFormulasHelp(): void {
    window.open('https://r.2sxc.org/functions', '_blank');
  }

  private buildTemplateVars(): void {
    const oldState = this.formulaDesignerService.getDesignerState();
    if (oldState.entityGuid == null && oldState.fieldName == null && oldState.target == null) {
      const entityGuid = this.itemEditFormRefs.first.entityGuid;
      const fieldsProps = this.itemEditFormRefs.first.fieldsSettingsService.getFieldsProps();
      const fieldName = Object.keys(fieldsProps)[0];
      const target = fieldName != null ? FormulaTargets.Value : null;
      const newState: DesignerState = {
        ...oldState,
        entityGuid,
        fieldName,
        target,
      };
      this.formulaDesignerService.setDesignerState(newState);
    }

    const options$ = combineLatest([
      this.formulaDesignerService.getDesignerState$(),
      this.formulaDesignerService.getFormulas$()
    ]).pipe(
      map(([designer, formulas]): SelectOptions => {
        const entityOptions = this.itemEditFormRefs.map(itemEditFormRef => {
          const entity: EntityOption = {
            entityGuid: itemEditFormRef.entityGuid,
            hasFormula: formulas.some(f => f.entityGuid === itemEditFormRef.entityGuid),
            label: itemEditFormRef.fieldsSettingsService.getContentTypeSettings()._itemTitle,
          };
          return entity;
        });

        const fieldOptions: FieldOption[] = [];
        if (designer.entityGuid != null) {
          const selectedItem = this.itemEditFormRefs.find(i => i.entityGuid === designer.entityGuid);
          const fieldsProps = selectedItem.fieldsSettingsService.getFieldsProps();
          for (const fieldName of Object.keys(fieldsProps)) {
            const field: FieldOption = {
              fieldName,
              hasFormula: formulas.some(f => f.entityGuid === designer.entityGuid && f.fieldName === fieldName),
              label: fieldName,
            };
            fieldOptions.push(field);
          }
        }

        const targetOptions: TargetOption[] = [];
        if (designer.entityGuid != null && designer.fieldName != null) {
          // default targets
          for (const target of Object.values(FormulaTargets)) {
            const targetOption: TargetOption = {
              hasFormula: formulas.some(
                f => f.entityGuid === designer.entityGuid && f.fieldName === designer.fieldName && f.target === target
              ),
              label: target.substring(target.lastIndexOf('.') + 1),
              target,
            };
            targetOptions.push(targetOption);
          }

          // targets for formulas
          const formulasForThisField = formulas.filter(f => f.entityGuid === designer.entityGuid && f.fieldName === designer.fieldName);
          for (const formula of formulasForThisField) {
            const formulaExists = targetOptions.some(t => t.target === formula.target);
            if (formulaExists) { continue; }

            const targetOption: TargetOption = {
              hasFormula: true,
              label: formula.target.substring(formula.target.lastIndexOf('.') + 1),
              target: formula.target,
            };
            targetOptions.push(targetOption);
          }

          // currently selected target
          const selectedExists = targetOptions.some(t => t.target === designer.target);
          if (!selectedExists) {
            const targetOption: TargetOption = {
              hasFormula: formulas.some(
                f => f.entityGuid === designer.entityGuid && f.fieldName === designer.fieldName && f.target === designer.target
              ),
              label: designer.target.substring(designer.target.lastIndexOf('.') + 1),
              target: designer.target,
            };
            targetOptions.push(targetOption);
          }
        }

        const selectOptions: SelectOptions = {
          entityOptions,
          fieldOptions,
          targetOptions,
        };
        return selectOptions;
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
        ? FormulaHelpers.buildDesignerSnippets(formula, options.fieldOptions)
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
          resultExists: result != null,
          resultIsError: result?.isError ?? false,
        };
        return templateVars;
      }),
    );
  }
}
