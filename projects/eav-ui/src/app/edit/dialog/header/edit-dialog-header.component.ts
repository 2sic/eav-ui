import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map, Observable } from 'rxjs';
import { EavService, FormsStateService } from '../../shared/services';
import { LanguageService, PublishStatusService } from '../../shared/store/ngrx-data';
import { EditDialogHeaderViewModel } from './edit-dialog-header.models';
import { PublishStatusDialogComponent } from './publish-status-dialog/publish-status-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { LanguageSwitcherComponent } from './language-switcher/language-switcher.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-edit-dialog-header',
    templateUrl: './edit-dialog-header.component.html',
    styleUrls: ['./edit-dialog-header.component.scss'],
    standalone: true,
    imports: [
        MatCardModule,
        MatButtonModule,
        SharedComponentsModule,
        MatIconModule,
        LanguageSwitcherComponent,
        AsyncPipe,
        UpperCasePipe,
        TranslateModule,
    ],
})
export class EditDialogHeaderComponent implements OnInit {
  @Input() disabled: boolean;
  @Output() private closeDialog = new EventEmitter<null>();

  viewModel$: Observable<EditDialogHeaderViewModel>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageService: LanguageService,
    private publishStatusService: PublishStatusService,
    public eavService: EavService,
    private formsStateService: FormsStateService,
  ) { }

  ngOnInit() {
    const readOnly$ = this.formsStateService.readOnly$;
    const hasLanguages$ = this.languageService.getLanguages$().pipe(map(languages => languages.length > 0));
    const publishMode$ = this.publishStatusService.getPublishMode$(this.eavService.eavConfig.formId);
    this.viewModel$ = combineLatest([readOnly$, hasLanguages$, publishMode$]).pipe(
      map(([readOnly, hasLanguages, publishMode]) => {
        const viewModel: EditDialogHeaderViewModel = {
          readOnly: readOnly.isReadOnly,
          readOnlyReason: readOnly.reason,
          hasLanguages,
          publishMode,
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
