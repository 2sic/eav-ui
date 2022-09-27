import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { tap, Observable } from "rxjs";
import { EavFormData } from "../../edit/dialog/main/edit-dialog-main.models";
import { EavService } from "../../edit/shared/services/eav.service";

@Injectable()
export class LanguageInitializerService {

  public initializeLanguages: Observable<EavFormData>;

  constructor(
    private eavService: EavService,
    private translate: TranslateService,
  ) { 
    this.initializeLanguages = this.eavService.fetchFormData("[]").pipe(
      tap(formData => {
        translate.setDefaultLang(this.langCode2(formData.Context.Language.Primary));
        translate.use(this.langCode2(formData.Context.Language.Current));
      })
    );
  }

  private langCode2(langCode5: string) {
    return langCode5.split('-')[0];
  }
}