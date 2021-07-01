import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService, FieldsTranslateService } from '../../../../shared/services';
import { ItemService, LanguageInstanceService } from '../../../../shared/store/ngrx-data';
import { EntityTranslateMenuTemplateVars } from './entity-translate-menu.models';

@Component({
  selector: 'app-entity-translate-menu',
  templateUrl: './entity-translate-menu.component.html',
  styleUrls: ['./entity-translate-menu.component.scss'],
})
export class EntityTranslateMenuComponent implements OnInit {
  @Input() entityGuid: string;

  templateVars$: Observable<EntityTranslateMenuTemplateVars>;

  constructor(
    private languageInstanceService: LanguageInstanceService,
    private itemService: ItemService,
    private eavService: EavService,
    private fieldsTranslateService: FieldsTranslateService,
  ) { }

  ngOnInit() {
    const slotIsEmpty$ = this.itemService.getItemHeader$(this.entityGuid).pipe(
      map(header => !header.Group?.SlotCanBeEmpty ? false : header.Group.SlotIsEmpty),
    );
    const currentLanguage$ = this.languageInstanceService.getCurrentLanguage$(this.eavService.eavConfig.formId);
    const defaultLanguage$ = this.languageInstanceService.getDefaultLanguage$(this.eavService.eavConfig.formId);
    this.templateVars$ = combineLatest([slotIsEmpty$, currentLanguage$, defaultLanguage$]).pipe(
      map(([slotIsEmpty, currentLanguage, defaultLanguage]) => {
        const templateVars: EntityTranslateMenuTemplateVars = {
          slotIsEmpty,
          currentLanguage,
          defaultLanguage,
        };
        return templateVars;
      }),
    );
  }

  translateMany() {
    this.fieldsTranslateService.translateMany();
  }

  dontTranslateMany() {
    this.fieldsTranslateService.dontTranslateMany();
  }
}
