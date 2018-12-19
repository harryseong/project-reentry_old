import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ByCategoriesComponent } from './by-categories.component';

describe('ByCategoriesComponent', () => {
  let component: ByCategoriesComponent;
  let fixture: ComponentFixture<ByCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ByCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ByCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
