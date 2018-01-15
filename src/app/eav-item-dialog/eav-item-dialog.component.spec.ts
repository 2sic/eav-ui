import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EavItemDialogComponent } from './eav-item-dialog.component';

describe('EavItemDialogComponent', () => {
  let component: EavItemDialogComponent;
  let fixture: ComponentFixture<EavItemDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EavItemDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EavItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*   it('should create', () => {
    expect(component).toBeTruthy();
   });  */
});
