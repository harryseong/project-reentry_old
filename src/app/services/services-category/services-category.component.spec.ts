import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCategoryComponent } from './services-category.component';

describe('ServicesCategoryComponent', () => {
  let component: ServicesCategoryComponent;
  let fixture: ComponentFixture<ServicesCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicesCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
