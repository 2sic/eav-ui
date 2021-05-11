import { Component, Input, OnInit, QueryList } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldValue } from '../../../../edit-types';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { LocalizationHelpers } from '../../../shared/helpers';
import { FormulaType, FormulaTypes } from '../../../shared/models';
import { EavService, FormulaDesignerService } from '../../../shared/services';
import { ContentTypeItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { ItemEditFormComponent } from '../../item-edit-form/item-edit-form.component';
import { defaultFormula } from './formula-designer.constants';
import { EntityOption, FieldOption } from './formula-designer.models';

@Component({
  selector: 'app-formula-designer',
  templateUrl: './formula-designer.component.html',
  styleUrls: ['./formula-designer.component.scss'],
})
export class FormulaDesignerComponent implements OnInit {
  @Input() private itemEditFormRefs: QueryList<ItemEditFormComponent>;

  FormulaTypes = FormulaTypes;
  loadError = false;
  entityOptions: EntityOption[];
  fieldOptions: Record<string, FieldOption[]>;
  selectedEntity: string;
  selectedField: string;
  selectedType: FormulaType;
  formula: string;
  editMode = false;
  result$: Observable<FieldValue>;

  constructor(
    private contentTypeItemService: ContentTypeItemService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
    private formulaDesignerService: FormulaDesignerService,
  ) { }

  ngOnInit(): void {
    this.buildOptionsAndFormula();
  }

  selectedEntityChanged(entityGuid: string): void {
    this.selectedEntity = entityGuid;
    this.selectedField = this.fieldOptions[this.selectedEntity][0].fieldName;
    this.loadFormula();
  }

  selectedFieldChanged(fieldName: string): void {
    this.selectedField = fieldName;
    this.loadFormula();
  }

  selectedTypeChanged(type: FormulaType): void {
    this.selectedType = type;
    this.loadFormula();
  }

  formulaChanged(formula: string): void {
    this.formula = formula;
    this.formulaDesignerService.upsertFormula(this.selectedEntity, this.selectedField, this.selectedType, this.formula);
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.loadFormula();
    if (this.editMode && this.formula) {
      this.formulaDesignerService.upsertFormula(this.selectedEntity, this.selectedField, this.selectedType, this.formula);
    }
  }

  reset(): void {
    this.editMode = false;
    this.formulaDesignerService.deleteFormula(this.selectedEntity, this.selectedField, this.selectedType);
    this.loadFormula();
  }

  run(): void {
    this.itemEditFormRefs.find(itemEditFormRef => itemEditFormRef.entityGuid === this.selectedEntity)
      .fieldsSettingsService.forceSettings();
  }

  openFunctionsHelp(): void {
    window.open('https://r.2sxc.org/functions', '_blank');
  }

  private buildOptionsAndFormula(): void {
    this.loadError = false;
    if (this.itemEditFormRefs == null) {
      this.loadError = true;
      return;
    }

    this.entityOptions = this.itemEditFormRefs.map(itemEditFormRef => {
      const entity: EntityOption = {
        entityGuid: itemEditFormRef.entityGuid,
        label: itemEditFormRef.fieldsSettingsService.getContentTypeSettings()._itemTitle,
      };
      return entity;
    });

    this.fieldOptions = {};
    this.itemEditFormRefs.forEach(itemEditFormRef => {
      const fields = Object.entries(itemEditFormRef.fieldsSettingsService.getFieldsProps())
        .filter(([fieldName, fieldProps]) => fieldProps.calculatedInputType.inputType !== InputTypeConstants.EmptyDefault)
        .map(([fieldName, fieldProps]) => {
          const field: FieldOption = {
            fieldName,
            label: fieldName,
          };
          return field;
        });
      this.fieldOptions[itemEditFormRef.entityGuid] = fields;
    });

    this.selectedEntity ??= this.entityOptions[0].entityGuid;
    this.selectedField ??= this.fieldOptions[this.selectedEntity][0].fieldName;
    this.selectedType ??= this.FormulaTypes.Value;

    this.loadFormula();
  }

  private loadFormula() {
    this.result$ = this.formulaDesignerService
      .getFormulaResult$(this.selectedEntity, this.selectedField, this.selectedType)
      .pipe(
        map(result => result?.isError ? 'Calculation failed. Please check console for more info' : result?.value),
      );

    this.formula = this.formulaDesignerService.getFormula(this.selectedEntity, this.selectedField, this.selectedType);
    if (this.formula != null) {
      return;
    }

    const selectedRef = this.itemEditFormRefs.find(itemEditFormRef => itemEditFormRef.entityGuid === this.selectedEntity);
    const settings = selectedRef.fieldsSettingsService.getFieldSettings(this.selectedField);
    const formulaItems = this.contentTypeItemService.getContentTypeItems(settings.Calculations);
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    const formulaItem = formulaItems.find(item => {
      const target: FormulaType = LocalizationHelpers.translate(currentLanguage, defaultLanguage, item.Attributes.Target, null);
      return target === this.selectedType;
    });
    if (formulaItem == null) {
      this.formula = this.editMode ? defaultFormula : null;
      return;
    }

    this.formula = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Formula, null);
    if (this.formula == null) {
      this.formula = this.editMode ? defaultFormula : null;
      return;
    }
  }
}
