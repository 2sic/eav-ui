import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, Input, OnDestroy, OnInit, QueryList, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import type * as Monaco from 'monaco-editor';
import { combineLatest, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';
import { EntitiesService } from '../../../../content-items/services/entities.service';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';
import { FormBuilderComponent } from '../../../form/builder/form-builder/form-builder.component';
import { FormulaDesignerService } from '../../../formulas/formula-designer.service';
import { defaultFormulaNow, listItemFormulaNow } from '../../../formulas/formula.constants';
import { FormulaHelpers } from '../../../formulas/helpers/formula.helpers';
import { FormulaListItemTargets, FormulaTarget, FormulaTargets } from '../../../formulas/models/formula.models';
import { InputFieldHelpers } from '../../../shared/helpers';
import { FormConfigService } from '../../../shared/services';
import { ContentTypeService, ItemService } from '../../../shared/store/ngrx-data';
// tslint:disable-next-line:max-line-length
import { DesignerSnippet, EntityOption, FieldOption, FormulaDesignerViewModel, SelectOptions, SelectTarget, SelectTargets } from './formula-designer.models';
import { DesignerState } from '../../../formulas/models/formula-results.models';
import { SnippetLabelSizePipe } from './snippet-label-size.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MonacoEditorComponent } from '../../../../monaco-editor/monaco-editor.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe, JsonPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { transient } from 'projects/eav-ui/src/app/core';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = true;
const nameOfThis = 'FormulaDesignerComponent';

@Component({
  selector: 'app-formula-designer',
  templateUrl: './formula-designer.component.html',
  styleUrls: ['./formula-designer.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgClass,
    ExtendedModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MonacoEditorComponent,
    MatMenuModule,
    AsyncPipe,
    JsonPipe,
    SnippetLabelSizePipe,
    TippyDirective,
  ],
})
export class FormulaDesignerComponent implements OnInit, OnDestroy {
  SelectTargets = SelectTargets;
  loadError = false;
  freeTextTarget = false;
  allowSaveFormula = this.formConfig.config.enableFormulaSave;
  isDeleted = signal(false);
  saving = signal(false);
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
  filename = `formula${this.formConfig.config.formId}.js`;
  focused = false;
  viewModel$: Observable<FormulaDesignerViewModel>;

  private entitiesService = transient(EntitiesService);

  private designerSvc = inject(FormulaDesignerService);
  protected result = this.designerSvc.formulaResult;
  protected contextSnippets = this.designerSvc.currentContextSnippets;
  protected targetOptions = this.designerSvc.currentTargetOptions;

  protected entityOptions = this.designerSvc.entityOptions;

  private log = new EavLogger(nameOfThis, logThis);
  
  constructor(
    private snackBar: MatSnackBar,
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.loadError = false;
    if (Object.keys(this.designerSvc.itemSettingsServices).length < 1) {
      this.loadError = true;
      return;
    }
    this.designerSvc.setDesignerOpen(true);
    this.buildViewModel();
  }

  ngOnDestroy(): void {
    this.designerSvc.setDesignerOpen(false);
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
      ...this.designerSvc.designerState(),
      editMode: false,
    };
    switch (target) {
      case SelectTargets.Entity:
        newState.entityGuid = value;
        const selectedSettingsSvc = this.designerSvc.itemSettingsServices[newState.entityGuid];
        newState.fieldName = Object.keys(selectedSettingsSvc.getFieldsProps())[0];
        break;
      case SelectTargets.Field:
        newState.fieldName = value;
        break;
      case SelectTargets.Target:
        newState.target = value as FormulaTarget;
        break;
    }

    this.designerSvc.designerState.set(newState);
  }

  toggleFreeText(): void {
    this.freeTextTarget = !this.freeTextTarget;
  }

  formulaChanged(formula: string): void {
    const designer = this.designerSvc.designerState();
    this.designerSvc.updateFormulaFromEditor(designer.entityGuid, designer.fieldName, designer.target, formula, false);
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
    const oldState = this.designerSvc.designerState();
    const designer: DesignerState = {
      ...oldState,
      editMode: !oldState.editMode,
    };
    this.designerSvc.designerState.set(designer);
    if (designer.editMode) {
      const formula = this.designerSvc.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
      if (formula == null) {
        this.designerSvc.updateFormulaFromEditor(
          designer.entityGuid, designer.fieldName, designer.target, Object.values(FormulaListItemTargets).includes(designer.target) ? listItemFormulaNow : defaultFormulaNow, false
        );
      }
    }
  }

  reset(): void {
    const designer: DesignerState = {
      ...this.designerSvc.designerState(),
      editMode: false,
    };
    this.designerSvc.designerState.set(designer);
    this.designerSvc.resetFormula(designer.entityGuid, designer.fieldName, designer.target);
    this.designerSvc.itemSettingsServices[designer.entityGuid].retriggerFormulas();
  }

  run(): void {
    const designer = this.designerSvc.designerState();
    const formula = this.designerSvc.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);
    this.designerSvc.updateFormulaFromEditor(designer.entityGuid, designer.fieldName, designer.target, formula.source, true);
    this.designerSvc.itemSettingsServices[designer.entityGuid].retriggerFormulas();
    this.isDeleted.set(false);
  }

  save(): void {
    this.saving.set(true);
    const designer = this.designerSvc.designerState();
    const formula = this.designerSvc.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);

    if (formula.sourceId == null) {
      const item = this.itemService.getItem(formula.entityGuid);
      const contentTypeId = InputFieldHelpers.getContentTypeId(item);
      const contentType = this.contentTypeService.getContentType(contentTypeId);
      const attributeDef = contentType.Attributes.find(a => a.Name === formula.fieldName);
      const atAllFieldSettings = attributeDef.Metadata.find(m => m.Type.Id === '@All');
      if (!atAllFieldSettings) {
        this.snackBar.open('Field configuration is missing. Please create formula in Administration', undefined, { duration: 3000 });
        this.saving.set(false);
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
        this.designerSvc.updateSaved(
          formula.entityGuid, formula.fieldName, formula.target, formula.source, savedFormula.Guid, savedFormula.Id,
        );
        this.snackBar.open('Formula saved', null, { duration: 2000 });
        this.saving.set(false);
      });
      return;
    }

    this.entitiesService.update(eavConstants.contentTypes.formulas, formula.sourceId, { Formula: formula.source }).subscribe(() => {
      this.designerSvc.updateSaved(
        formula.entityGuid, formula.fieldName, formula.target, formula.source, formula.sourceGuid, formula.sourceId,
      );
      this.snackBar.open('Formula saved', null, { duration: 2000 });
      this.saving.set(false);
    });
  }

  deleteFormula(): void {
    const designer = this.designerSvc.designerState();
    const formula = this.designerSvc.getFormula(designer.entityGuid, designer.fieldName, designer.target, true);

    const id = formula.sourceId;
    const title = formula.fieldName + ' - ' + formula.target;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed)
      return;

    this.entitiesService.delete(eavConstants.contentTypes.formulas, formula.sourceId, true).subscribe({
      next: () => {
        this.designerSvc.delete(formula.entityGuid, formula.fieldName, formula.target);
        this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.isDeleted.set(true);
        if (designer.editMode)
          this.toggleEdit();
      },
      error: (_: HttpErrorResponse) => {
        this.snackBar.open(this.translate.instant('Message.DeleteError'), null, { duration: 2000 });
      }
    });
  }

  private buildViewModel(): void {
    const oldState = this.designerSvc.designerState();
    if (oldState.entityGuid == null && oldState.fieldName == null && oldState.target == null) {
      const [entityGuid, settingsSvc] = Object.entries(this.designerSvc.itemSettingsServices)[0];
      const fieldsProps = settingsSvc.getFieldsProps();
      const fieldName = Object.keys(fieldsProps)[0];
      const target = fieldName != null ? FormulaTargets.Value : null;

      const newState: DesignerState = {
        ...oldState,
        entityGuid,
        fieldName,
        target,
      };
      this.designerSvc.designerState.set(newState);
    }

    // TODO: @2dm #formula-signals
    const designerState$ = this.designerSvc.getDesignerState$();
    const options$ = combineLatest([
      designerState$,
      this.designerSvc.getFormulas$()
    ]).pipe(
      map(([designer, formulas]): SelectOptions => {

        // Create array of formula relevant settings of all fields in the selected entity
        // this is also for the dropdown to list all fields, incl. fields which don't yet have a formula
        const fieldOptions: FieldOption[] = [];
        if (designer.entityGuid != null) {
          // find the current fieldSettingsService to get all properties
          const selectedSettings = this.designerSvc.itemSettingsServices[designer.entityGuid];
          const fieldsProps = selectedSettings.getFieldsProps();
          for (const fieldName of Object.keys(fieldsProps)) {
            const field: FieldOption = {
              fieldName,
              hasFormula: formulas.some(f => f.entityGuid === designer.entityGuid && f.fieldName === fieldName),
              label: fieldName,
            };
            fieldOptions.push(field);
          }
        }

        this.log.a('fieldOptions', { fieldOptions });

        // Create a list of formula targets for the selected field - eg. Value, Tooltip, ListItem.Label, ListItem.Tooltip etc.
        const targetOptions = this.designerSvc.currentTargetOptions();

        const selectOptions: SelectOptions = {
          fieldOptions,
          targetOptions,
        };
        return selectOptions;
      }),
    );

    // WIP
    const formula$ = designerState$.pipe(
      switchMap(designer => this.designerSvc.getFormula$(designer.entityGuid, designer.fieldName, designer.target)),
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

    const typings$ = combineLatest([options$, formula$, itemHeader$]).pipe(
      map(([options, formula, itemHeader]) => formula != null && itemHeader != null
        ? FormulaHelpers.buildFormulaTypings(formula, options.fieldOptions, itemHeader.Prefill)
        : ''
      ),
    );

    this.viewModel$ = combineLatest([
      options$,
      formula$,
      dataSnippets$,
      typings$,
      designerState$,
    ]).pipe(
      map(([
        options,
        formula,
        dataSnippets, 
        typings,
        designer,
      ]) => {
        const template = Object.values(FormulaListItemTargets).includes(designer.target)
          ? listItemFormulaNow
          : defaultFormulaNow;
        const viewModel: FormulaDesignerViewModel = {
          fieldOptions: options.fieldOptions,
          formula,
          designer,
          dataSnippets,
          typings,
          template,
        };
        return viewModel;
      }),
    );
  }

}
