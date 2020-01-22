import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiItemEditFormHeaderComponent } from './multi-item-edit-form-header.component';

describe('MultiItemEditFormHeaderComponent', () => {
  let component: MultiItemEditFormHeaderComponent;
  let fixture: ComponentFixture<MultiItemEditFormHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiItemEditFormHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiItemEditFormHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
