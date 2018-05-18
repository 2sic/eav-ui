import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDefaultComponent } from './entity-default.component';

describe('EntityDefaultComponent', () => {
  let component: EntityDefaultComponent;
  let fixture: ComponentFixture<EntityDefaultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EntityDefaultComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
