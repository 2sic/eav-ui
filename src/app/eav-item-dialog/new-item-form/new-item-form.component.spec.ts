import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewItemFormComponent } from './new-item-form.component';

describe('NewItemFormComponent', () => {
  let component: NewItemFormComponent;
  let fixture: ComponentFixture<NewItemFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewItemFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
