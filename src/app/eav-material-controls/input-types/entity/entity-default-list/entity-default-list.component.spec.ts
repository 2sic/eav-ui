import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDefaultListComponent } from './entity-default-list.component';

describe('EntityDefaultListComponent', () => {
  let component: EntityDefaultListComponent;
  let fixture: ComponentFixture<EntityDefaultListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityDefaultListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDefaultListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
