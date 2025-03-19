import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewpropertydashboardComponent } from './viewpropertydashboard.component';

describe('ViewpropertydashboardComponent', () => {
  let component: ViewpropertydashboardComponent;
  let fixture: ComponentFixture<ViewpropertydashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewpropertydashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewpropertydashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
