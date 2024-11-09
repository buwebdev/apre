import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PerformanceByMetricComponent } from './performance-by-metric.component';
import { By } from '@angular/platform-browser';

// Test suite for the PerformanceByMetric component
describe('PerformanceByMetricComponent', () => {
  let component: PerformanceByMetricComponent;
  let fixture: ComponentFixture<PerformanceByMetricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, PerformanceByMetricComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceByMetricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Default test that the component should be created
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test that the title is properly displayed
  it('should display the title "Agent Performance by Metric"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');

    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Agent Performance by Metric');
  });

  // Test that the performance metric select element has a default value of null
  it('should default to a null value for the performance metric select element', () => {
    // Create a reference to the perfMetric select element
    const perfMetricSelect = component.perfMetricForm.controls['perfMetric'];

    // Expect the value to be null
    expect(perfMetricSelect.value).toBeNull();
    // Expect the perfMetric control to be invalid
    expect(perfMetricSelect.valid).toBeFalse();
  });

  // Test that the form is not submitted if there is no selected metric
  it('should not submit if no metric is selected', () => {
    // Create a spy on the onSubmit function
    spyOn(component, 'onSubmit').and.callThrough();

    // Create a reference to the component's element
    const compiled = fixture.nativeElement;

    // Create a reference to the form's submit button
    const submitButton = compiled.querySelector('.form__actions button');

    // Simulate submitting
    submitButton.click();

    // Expect onSubmit to have been called
    expect(component.onSubmit).toHaveBeenCalled();
    // Expect the form to be invalid since we did not select a salesperson
    expect(component.perfMetricForm.valid).toBeFalse();
  });
});
