import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemEditFormComponent } from './item-edit-form.component';
import { FormlyModule, FieldWrapper } from '@ngx-formly/core';
import { StoreModule } from '@ngrx/store';
import { itemReducer, contentTypeReducer } from '../../shared/store/reducers';

describe('ItemEditFormComponent', () => {
  let component: ItemEditFormComponent;
  let fixture: ComponentFixture<ItemEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule,
        FormsModule,
        FormlyModule,
        StoreModule.forRoot({ items: itemReducer, contentTypes: contentTypeReducer })],
      declarations: [ItemEditFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
