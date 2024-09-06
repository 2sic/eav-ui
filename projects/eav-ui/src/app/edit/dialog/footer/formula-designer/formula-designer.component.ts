import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import type * as Monaco from 'monaco-editor';
import { EntityEditService } from '../../../../shared/services/entity-edit.service';
import { eavConstants } from '../../../../shared/constants/eav.constants';
import { copyToClipboard } from '../../../../shared/helpers/copy-to-clipboard.helper';
import { FormulaDesignerService } from '../../../formulas/designer/formula-designer.service';
import { defaultFormula, defaultListItemFormula } from '../../../formulas/formula-definitions';
import { FormulaNewPickerTargets, FormulaTarget } from '../../../formulas/targets/formula-targets';
import { DesignerSnippet, EntityOption, FieldOption, SelectTarget, SelectTargets } from './formula-designer.models';
import { FormulaIdentifier } from '../../../formulas/results/formula-results.models';
import { DesignerState } from '../../../formulas/designer/designer-state.model';
import { SnippetLabelSizePipe } from './snippet-label-size.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MonacoEditorComponent } from '../../../../monaco-editor/monaco-editor.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, JsonPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { transient } from '../../../../core/transient';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { FormConfigService } from '../../../form/form-config.service';
import { ItemService } from '../../../state/item.service';
import { ContentTypeService } from '../../../shared/content-types/content-type.service';
import { EditPrep } from '../../../../shared/models/edit-form.model';

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
    JsonPipe,
    SnippetLabelSizePipe,
    TippyDirective,
  ],
})
export class FormulaDesignerComponent implements OnInit, OnDestroy {

  #designerSvc = inject(FormulaDesignerService);

  #entitiesService = transient(EntityEditService);

  private log = new EavLogger(nameOfThis, logThis);
  
  constructor(
    private snackBar: MatSnackBar,
    private formConfig: FormConfigService,
    private itemService: ItemService,
    private contentTypeService: ContentTypeService,
    private translate: TranslateService,
  ) { }

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


  protected state = this.#designerSvc.designerState;
  protected result = this.#designerSvc.formulaResult;
  protected targetOptions = this.#designerSvc.currentTargetOptions;
  
  protected entityOptions = this.#designerSvc.entityOptions;
  protected fieldsOptions = this.#designerSvc.fieldsOptions;
  protected currentFormula = this.#designerSvc.currentFormula;

  protected v2JsTypings = this.#designerSvc.v2JsTypings;

  protected v1ContextSnippets = this.#designerSvc.v1ContextSnippets;
  protected v1DataSnippets = this.#designerSvc.v1DataSnippets;

  protected template = computed(() => Object.values(FormulaNewPickerTargets).includes(this.state().target)
    ? defaultListItemFormula
    : defaultFormula
  );


  ngOnInit(): void {
    // Make sure all necessary services have what they need, otherwise flag & exit
    // 1. Make sure the designer has access to all itemSettingsServices
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
    this.#designerSvc.cache.updateFormulaFromEditor(this.#designerIdentifier, formula, false);
  }

  onFocused(focused: boolean): void {
    this.focused = focused;
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
    if (designer.editMode && this.#designerSvc.currentFormula() == null)
      this.#designerSvc.cache.updateFormulaFromEditor(this.#designerIdentifier, this.template(), false);
  }

  reset(): void {
    const designer: DesignerState = {
      ...this.#designerSvc.designerState(),
      editMode: false,
    };
    const identifier = this.#designerIdentifier;
    this.#designerSvc.designerState.set(designer);
    this.#designerSvc.cache.resetFormula(identifier);
    this.#designerSvc.itemSettingsServices[identifier.entityGuid].retriggerFormulas('designer-reset');
  }

  run(): void {
    const identifier = this.#designerIdentifier;
    const formula = this.#designerSvc.currentFormula();
    this.#designerSvc.cache.updateFormulaFromEditor(identifier, formula.sourceCode, true);
    this.#designerSvc.itemSettingsServices[identifier.entityGuid].retriggerFormulas('designer-run');
    this.isDeleted.set(false);
  }

  get #designerIdentifier(): FormulaIdentifier {
    const designer = this.#designerSvc.designerState();
    const id: FormulaIdentifier = { entityGuid: designer.entityGuid, fieldName: designer.fieldName, target: designer.target };
    return id;
  }

  //#region Save/Delete

  save(): void {
    this.saving.set(true);
    const formula = this.#designerSvc.currentFormula();

    if (formula.sourceCodeId == null) {
      const item = this.itemService.get(formula.entityGuid);
      const attributeDef = this.contentTypeService.getAttributeOfItem(item, formula.fieldName);
      const atAllFieldSettings = attributeDef.Metadata.find(m => m.Type.Id === '@All');
      if (!atAllFieldSettings) {
        this.snackBar.open('Field configuration is missing. Please create formula in Administration', undefined, { duration: 3000 });
        this.saving.set(false);
        return;
      }
      this.#entitiesService.create(
        eavConstants.contentTypes.formulas,
        {
          Title: formula.target,
          Target: formula.target,
          Formula: formula.sourceCode,
          Enabled: true,
          ParentRelationship: EditPrep.relationship(atAllFieldSettings.Guid, 'Formulas'),
        },
      ).subscribe(savedFormula => {
        this.#designerSvc.cache.updateSaved(formula, savedFormula.Guid, savedFormula.Id);
        this.snackBar.open('Formula saved', null, { duration: 2000 });
        this.saving.set(false);
      });
      return;
    }

    this.#entitiesService.update(eavConstants.contentTypes.formulas, formula.sourceCodeId, { Formula: formula.sourceCode }).subscribe(() => {
      this.#designerSvc.cache.updateSaved(formula, formula.sourceCodeGuid, formula.sourceCodeId);
      this.snackBar.open('Formula saved', null, { duration: 2000 });
      this.saving.set(false);
    });
  }

  deleteFormula(): void {
    const designer = this.#designerSvc.designerState();
    const formula = this.#designerSvc.currentFormula();

    const id = formula.sourceCodeId;
    const title = formula.fieldName + ' - ' + formula.target;

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed)
      return;

    this.#entitiesService.delete(eavConstants.contentTypes.formulas, formula.sourceCodeId, true)
      .subscribe({
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

  //#endregion

}
