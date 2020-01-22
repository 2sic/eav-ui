import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyDefaultComponent } from './empty-default.component';

describe('EmptyDefaultComponent', () => {
  let component: EmptyDefaultComponent;
  let fixture: ComponentFixture<EmptyDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmptyDefaultComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
