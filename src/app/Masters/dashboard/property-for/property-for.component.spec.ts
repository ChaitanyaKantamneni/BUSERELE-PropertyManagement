import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyForComponent } from './property-for.component';

describe('PropertyForComponent', () => {
  let component: PropertyForComponent;
  let fixture: ComponentFixture<PropertyForComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyForComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyForComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
