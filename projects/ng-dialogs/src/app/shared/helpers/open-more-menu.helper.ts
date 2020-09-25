import { TemplateRef, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

export function openMoreMenu(templateRef: TemplateRef<any>, buttons: number, dialog: MatDialog, viewContainerRef: ViewContainerRef) {
  const container: HTMLElement = viewContainerRef.element.nativeElement;
  const position = container.getBoundingClientRect();
  const width = 24 + buttons * 40; // 2 * 12px padding + 40px for every button

  const dialogRef = dialog.open(templateRef, {
    width: `${width}px`,
    backdropClass: 'grid-more-dialog-backdrop',
    panelClass: 'grid-more-dialog-panel',
    position: {
      top: `${position.bottom - 16}px`,
      left: `${position.right - width}px`,
    },
    viewContainerRef,
    autoFocus: false,
  });
  return dialogRef;
}
