import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesByRegionComponent } from './sales-by-region.component';
import { By } from '@angular/platform-browser';

describe('SalesByRegionComponent', () => {
  let component: SalesByRegionComponent;
  let fixture: ComponentFixture<SalesByRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByRegionComponent] // Import SalesByRegionComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Sales by Region"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Region');
  });

  it('should initialize the regionForm with a null value', () => {
    const regionControl = component.regionForm.controls['region'];
    expect(regionControl.value).toBeNull();
    expect(regionControl.valid).toBeFalse();
  });

  it('should not submit the form if no region is selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.regionForm.valid).toBeFalse();
  });
});

// Add test cases for 'Submit' button update
describe('SalesByRegionComponent', () => {
  let component: SalesByRegionComponent; // Component instance for SalesByRegionComponent
  let fixture: ComponentFixture<SalesByRegionComponent>; // Test fixture for accessing and controlling the component

  // Runs before each test to set up the testing module and component instance
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesByRegionComponent] // Declare the component to be tested
    }).compileComponents(); // Compile the component's template and CSS

    fixture = TestBed.createComponent(SalesByRegionComponent); // Create the component's test fixture
    component = fixture.componentInstance; // Assign the component instance from the fixture
    fixture.detectChanges(); // Trigger initial data binding and rendering
  });

  // Test case to check if the button text displays "Get Data"
  it('should display "Get Data" as the button text', () => {
    // Find the button element within the component's template
    const buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;

    // Assert that the button text content matches "Get Data"
    expect(buttonElement.textContent.trim()).toBe('Get Data');
  });
});