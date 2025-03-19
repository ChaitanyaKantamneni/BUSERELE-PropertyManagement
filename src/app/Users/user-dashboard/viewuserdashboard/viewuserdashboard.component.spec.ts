import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewuserdashboardComponent } from './viewuserdashboard.component';

describe('ViewuserdashboardComponent', () => {
  let component: ViewuserdashboardComponent;
  let fixture: ComponentFixture<ViewuserdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewuserdashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewuserdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
