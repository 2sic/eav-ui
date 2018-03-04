import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StringUrlPathComponent } from './string-url-path.component';

describe('StringUrlPathComponent', () => {
  let component: StringUrlPathComponent;
  let fixture: ComponentFixture<StringUrlPathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StringUrlPathComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StringUrlPathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
