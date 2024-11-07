import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByMonthComponent } from './sales-by-month.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SalesByMonthComponent', () => {
  let component: SalesByMonthComponent;
  let fixture: ComponentFixture<SalesByMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Sales by Month"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Month');
  });

  it('should initialize the monthForm with a null values', () => {
    const monthControl = component.monthForm.controls['month'];
    const yearControl = component.monthForm.controls['year'];

    expect(monthControl.value).toBeNull();
    expect(monthControl.valid).toBeFalse();

    expect(yearControl.value).toBeNull();
    expect(yearControl.valid).toBeFalse();
  });

  it('should not submit the form if no month or year are selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.monthForm.valid).toBeFalse();
  });
});
