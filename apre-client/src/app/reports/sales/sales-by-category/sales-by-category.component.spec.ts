import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesByCategoryComponent } from './sales-by-category.component';

// Test Suite testing the Angular Component salesByCategory

describe('SalesByCategoryComponent', () => {
  let component: SalesByCategoryComponent;
  let fixture: ComponentFixture<SalesByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByCategoryComponent] // Import SalesByCategoryComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Three Unit Tests

  // Test to display title "Sales by Category"
  it('should display the title "Sales by Category"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Category');
  });

  it('should initialize the categoryForm with a null value', () => {
    const categoryControl = component.categoryForm.controls['category'];
    expect(categoryControl.value).toBeNull();
    expect(categoryControl.valid).toBeFalse();
  });

  it('should not submit the form if no category is selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.categoryForm.valid).toBeFalse();
  });
});
