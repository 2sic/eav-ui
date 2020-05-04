import { Component, OnInit, OnDestroy, ViewContainerRef, Type } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { Context } from '../../services/context';
import { DialogConfig } from '../../models/dialog-config.model';
import { angularConsoleLog } from '../../helpers/angular-console-log';

@Component({
  selector: 'app-dialog-entry',
  templateUrl: './dialog-entry.component.html',
  styleUrls: ['./dialog-entry.component.scss']
})
export class DialogEntryComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  private dialogRef: MatDialogRef<any, any>;
  private dialogConfig: DialogConfig;
  private component: Type<any>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
  ) {
    this.dialogConfig = this.route.snapshot.data.dialog;
    if (!this.dialogConfig) {
      throw new Error(`Could not find config for dialog. Did you forget to add DialogConfig to route data?`);
    }
  }

  async ngOnInit() {
    angularConsoleLog('Open dialog:', this.dialogConfig.name, 'Context id:', this.context.id, 'Context:', this.context);
    this.component = await this.dialogConfig.getComponent();
    if (this.dialogConfig.initContext) {
      this.context.init(this.route);
    }

    this.dialogRef = this.dialog.open(this.component, {
      backdropClass: 'dialog-backdrop',
      panelClass: [
        'dialog-panel',
        `dialog-panel-${this.dialogConfig.panelSize}`,
        this.dialogConfig.showScrollbar ? 'show-scrollbar' : 'no-scrollbar',
        ...(this.dialogConfig.panelClass ? this.dialogConfig.panelClass : []),
      ],
      viewContainerRef: this.viewContainerRef,
      autoFocus: false,
      closeOnNavigation: false,
      // spm NOTE: used to force align-items: flex-start; on cdk-global-overlay-wrapper.
      // Real top margin is overwritten in css e.g. dialog-panel-large
      position: { top: '0' }
    });

    this.subscription.add(
      this.dialogRef.afterClosed().subscribe((data: any) => {
        angularConsoleLog('Dialog was closed:', this.dialogConfig.name, 'Data:', data);

        if (this.route.pathFromRoot.length <= 3) {
          try {
            (window.parent as any).$2sxc.totalPopup.close();
          } catch (error) { }
          return;
        }

        if (this.route.snapshot.url.length > 0) {
          this.router.navigate(['./'], { relativeTo: this.route.parent, state: data });
        } else {
          this.router.navigate(['./'], { relativeTo: this.route.parent.parent, state: data });
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription = null;
    this.dialogConfig = null;
    this.component = null;
    this.dialogRef.close();
    this.dialogRef = null;
  }

}
