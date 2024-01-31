import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, QueryList } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import type * as Monaco from 'monaco-editor';
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';
import { EntitiesService } from '../../../../content-items/services/entities.service';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';
import { FormBuilderComponent } from '../../../form/builder/form-builder/form-builder.component';
import { FormulaDesignerService } from '../../../formulas/formula-designer.service';
import { defaultFormulaNow } from '../../../formulas/formula.constants';
import { FormulaHelpers } from '../../../formulas/helpers/formula.helpers';
import { FormulaTarget, FormulaTargets } from '../../../formulas/models/formula.models';
import { InputFieldHelpers } from '../../../shared/helpers';
import { EavService } from '../../../shared/services';
import { ContentTypeService, ItemService } from '../../../shared/store/ngrx-data';
// tslint:disable-next-line:max-line-length
import { DesignerSnippet, EntityOption, FieldOption, FormulaDesignerViewModel, SelectOptions, SelectTarget, SelectTargets, TargetOption } from './formula-designer.models';
import { DesignerState } from '../../../formulas/models/formula-results.models';
import { EmptyFieldHelpers } from '../../../form/fields/empty/empty-field-helpers';

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
  isDeleted$ = new BehaviorSubject(false);
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
  placeholder = defaultFormulaNow;
  focused = false;
  viewModel$: Observable<FormulaDesignerViewModel>;

  constructor(
    private formulaDesignerService: FormulaDesignerService,
    private snackBar: MatSnackBar,
    private eavService: EavService,
    private entitiesService: EntitiesService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.loadError = false;
    if (this.formBuilderRefs == null) {
      this.loadError = true;
      return;
    }
    this.formulaDesignerService.setDesignerOpen(true);
    this.buildViewModel();
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
    this.formulaDesignerService.updateFormulaFromEditor(designer.entityGuid, designer.fieldName, designer.target, formula, false);
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
        this.formulaDesignerService.updateFormulaFromEditor(
          designer.entityGuid, designer.fieldName, designer.target, defaultFormulaNow, false
        );
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
      .fieldsSettingsService.retriggerFormulas();
  }

  run(): void {
    const designer = this.formulaDesignerService.getDesignerState();
    const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
    this.formulaDesignerService.updateFormulaFromEditor(designer.entityGuid, designer.fieldName, designer.target, formula.source, true);
    this.formBuilderRefs
      .find(formBuilderRef => formBuilderRef.entityGuid === designer.entityGuid)
      .fieldsSettingsService.retriggerFormulas();
    this.isDeleted$.next(false);
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

  deleteFormula(): void {
    const designer = this.formulaDesignerService.getDesignerState();
    const formula = this.formulaDesignerService.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);

    const id = formula.sourceId;
    const title = formula.fieldName + ' - ' + formula.target;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) { return; }

    this.entitiesService.delete(eavConstants.contentTypes.formulas, formula.sourceId, true).subscribe({
      next: () => {
        this.formulaDesignerService.delete(formula.entityGuid, formula.fieldName, formula.target);
        this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.isDeleted$.next(true);
        if (designer.editMode)
          this.toggleEdit();
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open(this.translate.instant('Message.DeleteError'), null, { duration: 2000 });
      }
    });
  }

  openFormulasHelp(): void {
    window.open('https://go.2sxc.org/formulas', '_blank');
  }

  private buildViewModel(): void {
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
          const inputType = attribute.InputType;
          if (EmptyFieldHelpers.isGroupStart(inputType)) {
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
          if (inputType === InputTypeConstants.StringDropdown || inputType === InputTypeConstants.NumberDropdown) {
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
          /*
          TODO: @SDV
          for all picker types 
          add formulas -> Field.ListItem.Label
                          Field.ListItem.Tooltip
                          Field.ListItem.Information
                          Field.ListItem.HelpLink
                          Field.ListItem.Disabled

          Template for all new type formulas
          v2((data, context, item) => {
            return data.value;
          });

          old template for all of the rest

          run formulas upon dropdowning the picker, upon each opening
          */

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
        ? FormulaHelpers.buildDesignerSnippetsData(formula, options.fieldOptions, itemHeader.Prefill)
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
        ? FormulaHelpers.buildFormulaTypings(formula, options.fieldOptions, itemHeader.Prefill)
        : ''
      ),
    );
    const result$ = designerState$.pipe(
      switchMap(designer =>
        this.formulaDesignerService.getFormulaResult$(designer.entityGuid, designer.fieldName, designer.target)
      ),
    );

    this.viewModel$ = combineLatest([
      combineLatest([options$, formula$, dataSnippets$, contextSnippets$, typings$, designerState$]),
      combineLatest([result$, this.saving$, this.isDeleted$]),
    ]).pipe(
      map(([
        [options, formula, dataSnippets, contextSnippets, typings, designer],
        [result, saving, isDeleted],
      ]) => {
        const viewModel: FormulaDesignerViewModel = {
          entityOptions: options.entityOptions,
          fieldOptions: options.fieldOptions,
          targetOptions: options.targetOptions,
          formula,
          designer,
          dataSnippets,
          contextSnippets,
          typings,
          result: result?.value,
          resultExists: result != null && !isDeleted,
          resultIsError: result?.isError ?? false,
          resultIsOnlyPromise: result?.isOnlyPromise ?? false,
          saving,
        };
        return viewModel;
      }),
    );
  }
}
