import { Component, computed, EventEmitter, inject, Input, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { LanguageService, PublishStatusService } from '../../shared/store/ngrx-data';
import { PublishStatusDialogComponent } from './publish-status-dialog/publish-status-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { LanguageSwitcherComponent } from './language-switcher/language-switcher.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { FormConfigService } from '../../state/form-config.service';
import { FormsStateService } from '../../state/forms-state.service';

@Component({
  selector: 'app-edit-dialog-header',
  templateUrl: './edit-dialog-header.component.html',
  styleUrls: ['./edit-dialog-header.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    LanguageSwitcherComponent,
    AsyncPipe,
    UpperCasePipe,
    TranslateModule,
    TippyDirective,
  ],
})
export class EditDialogHeaderComponent {
  @Input() disabled: boolean;
  @Output() private closeDialog = new EventEmitter<null>();

  private formsStateService = inject(FormsStateService);
  protected readOnly = this.formsStateService.readOnly;

  protected publishMode = this.publishStatusService.getPublishMode(this.formConfig.config.formId)

  protected hasLanguages = computed(() => {
    const languages = this.languageService.getAllSignal();
    return languages().length > 0
  });

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageService: LanguageService,
    private publishStatusService: PublishStatusService,
    public formConfig: FormConfigService,
  ) { }

  close() {
    this.closeDialog.emit();
  }

  openPublishStatusDialog() {
    this.dialog.open(PublishStatusDialogComponent, {
      autoFocus: false,
      viewContainerRef: this.viewContainerRef,
      width: '350px',
    });
  }
}
