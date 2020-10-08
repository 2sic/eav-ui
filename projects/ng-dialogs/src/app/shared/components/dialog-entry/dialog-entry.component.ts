import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { NavigateFormResult } from '../../../../../../edit';
import { angularConsoleLog } from '../../helpers/angular-console-log.helper';
import { DialogConfig } from '../../models/dialog-config.model';
import { Context } from '../../services/context';

@Component({
  selector: 'app-dialog-entry',
  templateUrl: './dialog-entry.component.html',
  styleUrls: ['./dialog-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogEntryComponent implements OnInit, OnDestroy {
  private dialogData: { [key: string]: any; };
  private dialogRef: MatDialogRef<any>;

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
    private router: Router,
    private route: ActivatedRoute,
    private context: Context,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.dialogData = navigation?.extras?.state || {};
  }

  ngOnInit() {
    const dialogConfig: DialogConfig = this.route.snapshot.data.dialog;
    if (dialogConfig == null) {
      throw new Error(`Could not find config for dialog. Did you forget to add DialogConfig to route data?`);
    }
    angularConsoleLog('Open dialog:', dialogConfig.name, 'Context id:', this.context.id, 'Context:', this.context);

    dialogConfig.getComponent().then(component => {
      if (dialogConfig.initContext) {
        this.context.init(this.route);
      }

      this.dialogRef = this.dialog.open(component, {
        data: this.dialogData,
        backdropClass: 'dialog-backdrop',
        panelClass: [
          'dialog-panel',
          `dialog-panel-${dialogConfig.panelSize}`,
          dialogConfig.showScrollbar ? 'show-scrollbar' : 'no-scrollbar',
          ...(dialogConfig.panelClass ? dialogConfig.panelClass : []),
        ],
        viewContainerRef: this.viewContainerRef,
        autoFocus: false,
        closeOnNavigation: false,
        // spm NOTE: used to force align-items: flex-start; on cdk-global-overlay-wrapper.
        // Real top margin is overwritten in css e.g. dialog-panel-large
        position: { top: '0' }
      });

      this.dialogRef.afterClosed().pipe(take(1)).subscribe((data: any) => {
        angularConsoleLog('Dialog was closed:', dialogConfig.name, 'Data:', data);

        const navRes = data as NavigateFormResult;
        if (navRes?.navigateUrl != null) {
          this.router.navigate([navRes.navigateUrl]);
          return;
        }

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
      });

      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.dialogRef.close();
  }

}
