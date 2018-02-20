import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberDefaultComponent } from './number-default.component';

describe('NumberDefaultComponent', () => {
  let component: NumberDefaultComponent;
  let fixture: ComponentFixture<NumberDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NumberDefaultComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
