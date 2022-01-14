import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EavService, FormsStateService } from '../../shared/services';
import { LanguageService, PublishStatusService } from '../../shared/store/ngrx-data';
import { EditDialogHeaderTemplateVars } from './edit-dialog-header.models';
import { PublishStatusDialogComponent } from './publish-status-dialog/publish-status-dialog.component';

@Component({
  selector: 'app-edit-dialog-header',
  templateUrl: './edit-dialog-header.component.html',
  styleUrls: ['./edit-dialog-header.component.scss'],
})
export class EditDialogHeaderComponent implements OnInit {
  @Input() disabled: boolean;
  @Output() private closeDialog = new EventEmitter<null>();

  templateVars$: Observable<EditDialogHeaderTemplateVars>;

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
    this.templateVars$ = combineLatest([readOnly$, hasLanguages$, publishMode$]).pipe(
      map(([readOnly, hasLanguages, publishMode]) => {
        const templateVars: EditDialogHeaderTemplateVars = {
          readOnly,
          hasLanguages,
          publishMode,
        };
        return templateVars;
      }),
    );
  }

  close() {
    this.closeDialog.emit();
  }

  openPublishStatusDialog() {
    this.dialog.open(PublishStatusDialogComponent, {
      autoFocus: false,
      panelClass: 'c-publish-status-dialog',
      viewContainerRef: this.viewContainerRef,
      width: '350px',
    });
  }
}
