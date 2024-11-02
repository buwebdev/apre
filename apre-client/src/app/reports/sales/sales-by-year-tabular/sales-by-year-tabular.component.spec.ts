import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesByYearTabularComponent } from './sales-by-year-tabular.component';

describe('SalesByYearTabularComponent', () => {
  let component: SalesByYearTabularComponent;
  let fixture: ComponentFixture<SalesByYearTabularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByYearTabularComponent] // Import SalesByRegionTabularComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByYearTabularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it should display the title
  it('should display the title "Sales by Year - Tabular"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Year - Tabular');
  });

  // it should initialize the yearForm with a null value
  it('should initialize the yearForm with a null value', () => {
    const yearControl = component.yearForm.controls['year'];
    expect(yearControl.value).toBeNull();
    expect(yearControl.valid).toBeFalse();
  });

  //it should not submit if no year was selected
  it('should not submit the form if no year is selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.yearForm.valid).toBeFalse();
  });
});
