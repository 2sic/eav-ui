import { Component, OnInit, ViewContainerRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { Context } from '../../shared/context/context';

@Component({
  selector: 'app-code-editor-entry',
  templateUrl: './code-editor-entry.component.html',
  styleUrls: ['./code-editor-entry.component.scss']
})
export class CodeEditorEntryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private codeEditorDialogRef: MatDialogRef<CodeEditorComponent, any>;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.context.init(route);
  }

  ngOnInit() {
    this.codeEditorDialogRef = this.dialog.open(CodeEditorComponent, {
      backdropClass: 'code-editor-dialog-backdrop',
      panelClass: ['code-editor-dialog-panel', 'dialog-panel-fullscreen'],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
    });
    this.subscriptions.push(
      this.codeEditorDialogRef.afterClosed().subscribe(() => {
        console.log('Code editor dialog was closed.');
        if (this.route.parent.parent.parent) {
          this.router.navigate(['../'], { relativeTo: this.route });
        } else {
          alert('Close iframe!');
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
    this.codeEditorDialogRef.close();
    this.codeEditorDialogRef = null;
  }

}
