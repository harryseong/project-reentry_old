import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesNearComponent } from './services-near.component';

describe('ServicesNearComponent', () => {
  let component: ServicesNearComponent;
  let fixture: ComponentFixture<ServicesNearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicesNearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicesNearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
