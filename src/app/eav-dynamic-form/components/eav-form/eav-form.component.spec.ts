import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EavFormComponent } from './eav-form.component';

describe('EavFormComponent', () => {
  let component: EavFormComponent;
  let fixture: ComponentFixture<EavFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EavFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EavFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
