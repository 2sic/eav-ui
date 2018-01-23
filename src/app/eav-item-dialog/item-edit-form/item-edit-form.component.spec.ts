import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemEditFormComponent } from './item-edit-form.component';

describe('ItemEditFormComponent', () => {
  let component: ItemEditFormComponent;
  let fixture: ComponentFixture<ItemEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemEditFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
