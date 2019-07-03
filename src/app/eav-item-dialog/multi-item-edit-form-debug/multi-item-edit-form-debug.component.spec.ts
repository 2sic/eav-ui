import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiItemEditFormDebugComponent } from './multi-item-edit-form-debug.component';

describe('MultiItemEditFormDebugComponent', () => {
  let component: MultiItemEditFormDebugComponent;
  let fixture: ComponentFixture<MultiItemEditFormDebugComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiItemEditFormDebugComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiItemEditFormDebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
