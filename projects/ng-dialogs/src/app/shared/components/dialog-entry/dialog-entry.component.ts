import { Component, OnInit, OnDestroy, ViewContainerRef, Type } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { Context } from '../../context/context';
import { DialogService } from '../dialog-service/dialog.service';
import { ClosedDialogData } from '../../models/closed-dialog.model';
import { DialogConfig } from '../../models/dialog-config.model';

@Component({
  selector: 'app-dialog-entry',
  templateUrl: './dialog-entry.component.html',
  styleUrls: ['./dialog-entry.component.scss']
})
export class DialogEntryComponent implements OnInit, OnDestroy {
  production: boolean;

  private subscription = new Subscription();
  private dialogRef: MatDialogRef<any, any>;
  private dialogName: string;
  private component: Type<any>;
  private panelSize: string;
  private panelClass: string[] = [];

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private dialogService: DialogService,
  ) {
    this.production = environment.production;
  }

  async ngOnInit() {
    await this.configureDialog();
    console.log('Open dialog:', this.dialogName, 'Context id:', this.context.id, 'Context:', this.context);

    this.dialogRef = this.dialog.open(this.component, {
      backdropClass: 'dialog-backdrop',
      panelClass: ['dialog-panel', `dialog-panel-${this.panelSize}`, 'no-scrollbar', ...this.panelClass],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
      // spm NOTE: used to force align-items: flex-start; on cdk-global-overlay-wrapper.
      // Real top margin is overwritten in css e.g. dialog-panel-large
      position: { top: '0' }
    });

    this.subscription.add(
      this.dialogRef.afterClosed().subscribe((data: ClosedDialogData) => {
        this.dialogService.fireClosed(this.dialogName, data);

        if (this.route.pathFromRoot.length <= 3) {
          try {
            (window.parent as any).$2sxc.totalPopup.close();
          } catch (error) { }
          return;
        }

        if (this.route.snapshot.url.length > 0) {
          this.router.navigate(['./'], { relativeTo: this.route.parent });
        } else {
          this.router.navigate(['./'], { relativeTo: this.route.parent.parent });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
    this.component = null;
    this.dialogRef.close();
    this.dialogRef = null;
  }

  private async configureDialog() {
    this.dialogName = this.route.snapshot.data.dialogName;
    if (!this.dialogName) {
      throw new Error(`Could not find dialog type: ${this.dialogName}. Did you forget to add dialogName to route data?`);
    }
    const dialogConfig: DialogConfig = this.route.snapshot.data.dialogConfig;
    if (!dialogConfig) {
      throw new Error(`Could not find config for dialog: ${this.dialogName}. Did you forget to add dialogConfig to route data?`);
    }
    this.component = await dialogConfig.getComponent();
    this.panelSize = dialogConfig.panelSize;
    if (dialogConfig.initContext) {
      this.context.init(this.route);
    }
    if (dialogConfig.panelClass) {
      this.panelClass = dialogConfig.panelClass;
    }
  }

}
