import { Component, EventEmitter, inject, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map, Observable } from 'rxjs';
import { LanguageService, PublishStatusService } from '../../shared/store/ngrx-data';
import { EditDialogHeaderViewModel } from './edit-dialog-header.models';
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
export class EditDialogHeaderComponent implements OnInit {
  @Input() disabled: boolean;
  @Output() private closeDialog = new EventEmitter<null>();

  viewModel$: Observable<EditDialogHeaderViewModel>;

  private formsStateService = inject(FormsStateService);
  protected readOnly = this.formsStateService.readOnly;

  protected publishMode = this.publishStatusService.getPublishModeSignal(this.formConfig.config.formId)

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageService: LanguageService,
    private publishStatusService: PublishStatusService,
    public formConfig: FormConfigService,

  ) { }

  ngOnInit() {

    // TODO:: @2dg Question, refactor store and then this getLanguages Signal ?
    const hasLanguages$ = this.languageService.getLanguages$().pipe(map(languages => languages.length > 0));

    this.viewModel$ = combineLatest([hasLanguages$]).pipe(
      map(([hasLanguages]) => {
        const viewModel: EditDialogHeaderViewModel = {
          hasLanguages,
        };
        return viewModel;
      }),
    );
  }

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
