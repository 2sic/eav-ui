import { Component, Input, OnInit, QueryList } from '@angular/core';
import { InputTypeConstants } from '../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { LocalizationHelpers } from '../../../shared/helpers';
import { FormulaType, FormulaTypes } from '../../../shared/models';
import { EavService } from '../../../shared/services';
import { ContentTypeItemService, LanguageInstanceService } from '../../../shared/store/ngrx-data';
import { ItemEditFormComponent } from '../../item-edit-form/item-edit-form.component';
import { defaultFormulaFunction } from './formula-designer.constants';
import { EntityOption, FieldOption } from './formula-designer.models';

@Component({
  selector: 'app-formula-designer',
  templateUrl: './formula-designer.component.html',
  styleUrls: ['./formula-designer.component.scss'],
})
export class FormulaDesignerComponent implements OnInit {
  @Input() private itemEditFormRefs: QueryList<ItemEditFormComponent>;

  FormulaTypes = FormulaTypes;
  entityOptions: EntityOption[];
  fieldOptions: Record<string, FieldOption[]>;
  selectedEntity: string;
  selectedField: string;
  selectedFormulaType: FormulaType;
  formulaFunction: string;
  formulaLoadError = false;

  constructor(
    private contentTypeItemService: ContentTypeItemService,
    private languageInstanceService: LanguageInstanceService,
    private eavService: EavService,
  ) { }

  ngOnInit(): void {
    this.buildFunctionsProps();
  }

  selectedEntityChanged(entityGuid: string): void {
    this.selectedEntity = entityGuid;
    this.selectedField = this.fieldOptions[this.selectedEntity][0].fieldName;
    this.loadFunction();
  }

  selectedFieldChanged(fieldName: string): void {
    this.selectedField = fieldName;
    this.loadFunction();
  }

  selectedFormulaTypeChanged(type: FormulaType): void {
    this.selectedFormulaType = type;
    this.loadFunction();
  }

  formulaFunctionChanged(formulaFunction: string): void {
    this.formulaFunction = formulaFunction;
  }

  openFunctionsHelp(): void {
    window.open('https://r.2sxc.org/functions', '_blank');
  }

  private buildFunctionsProps(): void {
    this.formulaLoadError = false;
    if (this.itemEditFormRefs == null) {
      this.formulaLoadError = true;
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
    this.selectedFormulaType ??= this.FormulaTypes.Value;

    this.loadFunction();
  }

  private loadFunction() {
    const selectedRef = this.itemEditFormRefs.find(itemEditFormRef => itemEditFormRef.entityGuid === this.selectedEntity);
    const settings = selectedRef.fieldsSettingsService.getFieldSettings(this.selectedField);
    const formulaItems = this.contentTypeItemService.getContentTypeItems(settings.Calculations);
    const currentLanguage = this.languageInstanceService.getCurrentLanguage(this.eavService.eavConfig.formId);
    const defaultLanguage = this.languageInstanceService.getDefaultLanguage(this.eavService.eavConfig.formId);

    const formulaItem = formulaItems.find(item => {
      const target: FormulaType = LocalizationHelpers.translate(currentLanguage, defaultLanguage, item.Attributes.Target, null);
      return target === this.selectedFormulaType;
    });
    if (formulaItem == null) {
      this.formulaFunction = defaultFormulaFunction;
      return;
    }

    const formula: string = LocalizationHelpers.translate(currentLanguage, defaultLanguage, formulaItem.Attributes.Formula, null);
    if (formula == null) {
      this.formulaFunction = defaultFormulaFunction;
      return;
    }

    this.formulaFunction = formula;
  }
}
