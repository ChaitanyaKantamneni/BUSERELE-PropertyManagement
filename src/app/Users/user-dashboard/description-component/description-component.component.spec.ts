import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescriptionComponentComponent } from './description-component.component';

describe('DescriptionComponentComponent', () => {
  let component: DescriptionComponentComponent;
  let fixture: ComponentFixture<DescriptionComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescriptionComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescriptionComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
