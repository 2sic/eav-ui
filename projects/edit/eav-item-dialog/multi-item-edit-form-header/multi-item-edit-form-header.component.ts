import { Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PublishStatusDialogComponent } from '../../eav-material-controls/dialogs/publish-status-dialog/publish-status-dialog.component';
import { EavService } from '../../shared/services';
import { LanguageService, PublishStatusService } from '../../shared/store/ngrx-data';
import { FormHeaderTemplateVars } from './multi-item-edit-form-header.models';

@Component({
  selector: 'app-multi-item-edit-form-header',
  templateUrl: './multi-item-edit-form-header.component.html',
  styleUrls: ['./multi-item-edit-form-header.component.scss'],
})
export class MultiItemEditFormHeaderComponent implements OnInit {
  @Input() disabled: boolean;
  @Output() private closeDialog = new EventEmitter<null>();

  templateVars$: Observable<FormHeaderTemplateVars>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private languageService: LanguageService,
    private publishStatusService: PublishStatusService,
    public eavService: EavService,
  ) { }

  ngOnInit() {
    const hasLanguages$ = this.languageService.getLanguages$().pipe(map(languages => languages.length > 0));
    const publishMode$ = this.publishStatusService.getPublishMode$(this.eavService.eavConfig.formId);
    this.templateVars$ = combineLatest([hasLanguages$, publishMode$]).pipe(
      map(([hasLanguages, publishMode]) => {
        const templateVars: FormHeaderTemplateVars = {
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
      panelClass: 'c-publish-status-dialog',
      autoFocus: false,
      width: '350px',
      viewContainerRef: this.viewContainerRef,
    });
  }
}
