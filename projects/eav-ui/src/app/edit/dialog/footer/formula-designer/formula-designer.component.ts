import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import type * as Monaco from 'monaco-editor';
import { EntitiesService } from '../../../../content-items/services/entities.service';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';
import { FormulaDesignerService } from '../../../formulas/formula-designer.service';
import { defaultFormulaNow, listItemFormulaNow } from '../../../formulas/formula.constants';
import { FormulaListItemTargets, FormulaTarget } from '../../../formulas/models/formula.models';
import { DesignerSnippet, EntityOption, FieldOption, SelectTarget, SelectTargets } from './formula-designer.models';
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
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { transient } from '../../../../core/transient';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { FormConfigService } from '../../../state/form-config.service';
import { ItemService } from '../../../shared/store/item.service';
import { ContentTypeService } from '../../../shared/store/content-type.service';

const logThis = false;
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

  private entitiesService = transient(EntitiesService);

  #designerSvc = inject(FormulaDesignerService);
  protected state = this.#designerSvc.designerState;
  protected result = this.#designerSvc.formulaResult;
  protected targetOptions = this.#designerSvc.currentTargetOptions;
  
  protected entityOptions = this.#designerSvc.entityOptions;
  protected fieldsOptions = this.#designerSvc.fieldsOptions;
  protected currentFormula = this.#designerSvc.currentFormula;

  protected v2JsTypings = this.#designerSvc.v2JsTypings;

  protected v1ContextSnippets = this.#designerSvc.v1ContextSnippets;
  protected v1DataSnippets = this.#designerSvc.v1DataSnippets;

  protected template = computed(() => {
    return Object.values(FormulaListItemTargets).includes(this.state().target)
    ? listItemFormulaNow
    : defaultFormulaNow;
  });

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
    if (Object.keys(this.#designerSvc.itemSettingsServices).length < 1) {
      this.loadError = true;
      return;
    }
    
    this.#designerSvc.setDesignerOpen(true);
    this.#designerSvc.initAfterItemSettingsAreReady();
  }

  ngOnDestroy(): void {
    this.#designerSvc.setDesignerOpen(false);
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
      ...this.#designerSvc.designerState(),
      editMode: false,
    };
    switch (target) {
      case SelectTargets.Entity:
        newState.entityGuid = value;
        const selectedSettingsSvc = this.#designerSvc.itemSettingsServices[newState.entityGuid];
        newState.fieldName = Object.keys(selectedSettingsSvc.getFieldsProps())[0];
        break;
      case SelectTargets.Field:
        newState.fieldName = value;
        break;
      case SelectTargets.Target:
        newState.target = value as FormulaTarget;
        break;
    }

    this.#designerSvc.designerState.set(newState);
  }

  toggleFreeText(): void {
    this.freeTextTarget = !this.freeTextTarget;
  }

  formulaChanged(formula: string): void {
    const designer = this.#designerSvc.designerState();
    this.#designerSvc.cache.updateFormulaFromEditor(designer, formula, false);
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
    const oldState = this.#designerSvc.designerState();
    const designer: DesignerState = {
      ...oldState,
      editMode: !oldState.editMode,
    };
    this.#designerSvc.designerState.set(designer);
    if (designer.editMode) {
      const formula = this.#designerSvc.currentFormula();
      if (formula == null) {
        this.#designerSvc.cache.updateFormulaFromEditor(designer, Object.values(FormulaListItemTargets).includes(designer.target) ? listItemFormulaNow : defaultFormulaNow, false);
      }
    }
  }

  reset(): void {
    const designer: DesignerState = {
      ...this.#designerSvc.designerState(),
      editMode: false,
    };
    this.#designerSvc.designerState.set(designer);
    this.#designerSvc.cache.resetFormula(designer);
    this.#designerSvc.itemSettingsServices[designer.entityGuid].retriggerFormulas();
  }

  run(): void {
    const designer = this.#designerSvc.designerState();
    const formula = this.#designerSvc.currentFormula();
    this.#designerSvc.cache.updateFormulaFromEditor(designer, formula.source, true);
    this.#designerSvc.itemSettingsServices[designer.entityGuid].retriggerFormulas();
    this.isDeleted.set(false);
  }

  save(): void {
    this.saving.set(true);
    const formula = this.#designerSvc.currentFormula();

    if (formula.sourceId == null) {
      const item = this.itemService.get(formula.entityGuid);
      const contentType = this.contentTypeService.getContentTypeOfItem(item);
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
        this.#designerSvc.cache.updateSaved(formula, savedFormula.Guid, savedFormula.Id);
        this.snackBar.open('Formula saved', null, { duration: 2000 });
        this.saving.set(false);
      });
      return;
    }

    this.entitiesService.update(eavConstants.contentTypes.formulas, formula.sourceId, { Formula: formula.source }).subscribe(() => {
      this.#designerSvc.cache.updateSaved(formula, formula.sourceGuid, formula.sourceId);
      this.snackBar.open('Formula saved', null, { duration: 2000 });
      this.saving.set(false);
    });
  }

  deleteFormula(): void {
    const designer = this.#designerSvc.designerState();
    const formula = this.#designerSvc.currentFormula();

    const id = formula.sourceId;
    const title = formula.fieldName + ' - ' + formula.target;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed)
      return;

    this.entitiesService.delete(eavConstants.contentTypes.formulas, formula.sourceId, true).subscribe({
      next: () => {
        this.#designerSvc.cache.delete(formula);
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

  
}
