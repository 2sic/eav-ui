import { Component, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import type * as Monaco from 'monaco-editor';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';
import { EntitiesService } from '../../../../content-items/services/entities.service';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';
import { FormBuilderComponent } from '../../../form/builder/form-builder/form-builder.component';
import { defaultFormulaV1 } from '../../../shared/constants';
import { FormulaHelpers, InputFieldHelpers } from '../../../shared/helpers';
import { DesignerState, FormulaTarget, FormulaTargets } from '../../../shared/models';
import { EavService, FormulaDesignerService } from '../../../shared/services';
import { ContentTypeService, ItemService } from '../../../shared/store/ngrx-data';
// tslint:disable-next-line:max-line-length
import { DesignerSnippet, EntityOption, FieldOption, FormulaDesignerTemplateVars, SelectOptions, SelectTarget, SelectTargets, TargetOption } from './formula-designer.models';

@Component({
  selector: 'app-formula-designer',
  templateUrl: './formula-designer.component.html',
  styleUrls: ['./formula-designer.component.scss'],
})
export class FormulaDesignerComponent implements OnInit, OnDestroy {
  @Input() formBuilderRefs: QueryList<FormBuilderComponent>;

  SelectTargets = SelectTargets;
  loadError = false;
  freeTextTarget = false;
  allowSaveFormula = this.eavService.eavConfig.enableFormulaSave;
  saving$ = new BehaviorSubject(false);
  monacoOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: {
      enabled: false,
    },
    lineHeight: 19,
    lineNumbers: 'off',
    lineDecorationsWidth: 0,
    folding: false,
    scrollBeyondLastLine: false,
    tabSize: 2,
    fixedOverflowWidgets: true,
  };
  filename = `formula${this.eavService.eavConfig.formId}.js`;
  placeholder = defaultFormulaV1;
  focused = false;
  templateVars$: Observable<FormulaDesignerTemplateVars>;

  constructor(
    private formulaDesignerService: FormulaDesignerService,
    private snackBar: MatSnackBar,
    private eavService: EavService,
    private entitiesService: EntitiesService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
  ) { }

  ngOnInit(): void {
    this.loadError = false;
    if (this.formBuilderRefs == null) {
      this.loadError = true;
      return;
    }
    this.formulaDesignerService.setDesignerOpen(true);
    this.buildTemplateVars();
  }

  ngOnDestroy(): void {
    this.formulaDesignerService.setDesignerOpen(false);
    this.saving$.complete();
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
        const selectedFormRef = this.formBuilderRefs.find(formBuilderRef => formBuilderRef.entityGuid === newState.entityGuid);
        newState.fieldName = Object.keys(selectedFormRef.fieldsSettingsService.getFieldsProps())[0];
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

  onFocused(): void {
    this.focused = true;
  }

  onBlurred(): void {
    this.focused = false;
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
        this.formulaDesignerService.upsertFormula(designer.entityGuid, designer.fieldName, designer.target, defaultFormulaV1, false);
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
    this.formBuilderRefs
      .find(formBuilderRef => formBuilderRef.entityGuid === designer.entityGuid)
      .fieldsSettingsService.forceSettings();
  }

  run(): void {
    const designer = this.formulaDesignerService.getDesignerState();
    const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
    this.formulaDesignerService.upsertFormula(designer.entityGuid, designer.fieldName, designer.target, formula.source, true);
    this.formBuilderRefs
      .find(formBuilderRef => formBuilderRef.entityGuid === designer.entityGuid)
      .fieldsSettingsService.forceSettings();
  }

  save(): void {
    this.saving$.next(true);
    const designer = this.formulaDesignerService.getDesignerState();
    const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);

    if (formula.sourceId == null) {
      const item = this.itemService.getItem(formula.entityGuid);
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);
      const attributeDef = contentType.Attributes.find(a => a.Name === formula.fieldName);
      const atAllFieldSettings = attributeDef.Metadata.find(m => m.Type.Id === '@All');
      if (!atAllFieldSettings) {
        this.snackBar.open('Field configuration is missing. Please create formula in Administration', undefined, { duration: 3000 });
        this.saving$.next(false);
        return;
      }
      this.entitiesService.create(
        eavConstants.contentTypes.formulas,
        {
          Title: formula.target,
          Target: formula.target,
          Formula: formula.source,
          Enabled: true,
          ParentRelationship: {
            Add: null,
            EntityId: null,
            Field: 'Formulas',
            Index: 0,
            Parent: atAllFieldSettings.Guid,
          },
        },
      ).subscribe(savedFormula => {
        this.formulaDesignerService.updateSaved(
          formula.entityGuid, formula.fieldName, formula.target, formula.source, savedFormula.Guid, savedFormula.Id,
        );
        this.snackBar.open('Formula saved', null, { duration: 2000 });
        this.saving$.next(false);
      });
      return;
    }

    this.entitiesService.update(eavConstants.contentTypes.formulas, formula.sourceId, { Formula: formula.source }).subscribe(() => {
      this.formulaDesignerService.updateSaved(
        formula.entityGuid, formula.fieldName, formula.target, formula.source, formula.sourceGuid, formula.sourceId,
      );
      this.snackBar.open('Formula saved', null, { duration: 2000 });
      this.saving$.next(false);
    });
  }

  openFormulasHelp(): void {
    window.open('http://r.2sxc.org/formulas', '_blank');
  }

  private buildTemplateVars(): void {
    const oldState = this.formulaDesignerService.getDesignerState();
    if (oldState.entityGuid == null && oldState.fieldName == null && oldState.target == null) {
      const entityGuid = this.formBuilderRefs.first.entityGuid;
      const fieldsProps = this.formBuilderRefs.first.fieldsSettingsService.getFieldsProps();
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

    const designerState$ = this.formulaDesignerService.getDesignerState$();
    const options$ = combineLatest([
      designerState$,
      this.formulaDesignerService.getFormulas$()
    ]).pipe(
      map(([designer, formulas]): SelectOptions => {
        const entityOptions = this.formBuilderRefs.map(formBuilderRef => {
          const entity: EntityOption = {
            entityGuid: formBuilderRef.entityGuid,
            hasFormula: formulas.some(f => f.entityGuid === formBuilderRef.entityGuid),
            label: formBuilderRef.fieldsSettingsService.getContentTypeSettings()._itemTitle,
          };
          return entity;
        });

        const fieldOptions: FieldOption[] = [];
        if (designer.entityGuid != null) {
          const selectedItem = this.formBuilderRefs.find(i => i.entityGuid === designer.entityGuid);
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

          // optional targets
          const item = this.itemService.getItem(designer.entityGuid);
          const contentTypeId = InputFieldHelpers.getContentTypeId(item);
          const contentType = this.contentTypeService.getContentType(contentTypeId);
          const attribute = contentType.Attributes.find(a => a.Name === designer.fieldName);
          if (attribute.InputType === InputTypeConstants.EmptyDefault) {
            for (const target of ['Field.Settings.Collapsed']) {
              const targetOption: TargetOption = {
                hasFormula: formulas.some(
                  f => f.entityGuid === designer.entityGuid && f.fieldName === designer.fieldName && f.target === target
                ),
                label: target.substring(target.lastIndexOf('.') + 1),
                target: target as FormulaTarget,
              };
              targetOptions.push(targetOption);
            }
          }
          if (attribute.InputType === InputTypeConstants.StringDropdown || attribute.InputType === InputTypeConstants.NumberDropdown) {
            for (const target of ['Field.Settings.DropdownValues']) {
              const targetOption: TargetOption = {
                hasFormula: formulas.some(
                  f => f.entityGuid === designer.entityGuid && f.fieldName === designer.fieldName && f.target === target
                ),
                label: target.substring(target.lastIndexOf('.') + 1),
                target: target as FormulaTarget,
              };
              targetOptions.push(targetOption);
            }
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
    const formula$ = designerState$.pipe(
      switchMap(designer => this.formulaDesignerService.getFormula$(designer.entityGuid, designer.fieldName, designer.target, true)),
    );
    const itemHeader$ = designerState$.pipe(
      map(designer => designer.entityGuid),
      distinctUntilChanged(),
      switchMap(entityGuid => this.itemService.getItemHeader$(entityGuid)),
    );
    const dataSnippets$ = combineLatest([options$, formula$, itemHeader$]).pipe(
      map(([options, formula, itemHeader]) => formula != null && itemHeader != null
        ? FormulaHelpers.buildDesignerSnippetsData(formula, options.fieldOptions, itemHeader)
        : []
      ),
    );
    const contextSnippets$ = combineLatest([formula$]).pipe(
      map(([formula]) => formula != null
        ? FormulaHelpers.buildDesignerSnippetsContext(formula)
        : []
      ),
    );
    const typings$ = combineLatest([options$, formula$, itemHeader$]).pipe(
      map(([options, formula, itemHeader]) => formula != null && itemHeader != null
        ? FormulaHelpers.buildFormulaTypings(formula, options.fieldOptions, itemHeader)
        : ''
      ),
    );
    const result$ = designerState$.pipe(
      switchMap(designer =>
        this.formulaDesignerService.getFormulaResult$(designer.entityGuid, designer.fieldName, designer.target)
      ),
    );

    this.templateVars$ = combineLatest([
      combineLatest([options$, formula$, dataSnippets$, contextSnippets$, typings$, designerState$]),
      combineLatest([result$, this.saving$]),
    ]).pipe(
      map(([
        [options, formula, dataSnippets, contextSnippets, typings, designer],
        [result, saving],
      ]) => {
        const templateVars: FormulaDesignerTemplateVars = {
          entityOptions: options.entityOptions,
          fieldOptions: options.fieldOptions,
          targetOptions: options.targetOptions,
          formula,
          designer,
          dataSnippets,
          contextSnippets,
          typings,
          result: result?.value,
          resultExists: result != null,
          resultIsError: result?.isError ?? false,
          saving,
        };
        return templateVars;
      }),
    );
  }
}
