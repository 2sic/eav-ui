import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiItemEditFormComponent } from './multi-item-edit-form.component';

describe('MultiItemEditFormComponent', () => {
  let component: MultiItemEditFormComponent;
  let fixture: ComponentFixture<MultiItemEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiItemEditFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiItemEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
