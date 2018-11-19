import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveStatusDialogComponent } from './save-status-dialog.component';

describe('SaveStatusDialogComponent', () => {
  let component: SaveStatusDialogComponent;
  let fixture: ComponentFixture<SaveStatusDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SaveStatusDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
