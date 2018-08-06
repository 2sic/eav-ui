import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogOverviewExampleDialogComponent } from './dialog-overview-example-dialog.component';

describe('DialogOverviewExampleDialogComponent', () => {
  let component: DialogOverviewExampleDialogComponent;
  let fixture: ComponentFixture<DialogOverviewExampleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DialogOverviewExampleDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogOverviewExampleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
