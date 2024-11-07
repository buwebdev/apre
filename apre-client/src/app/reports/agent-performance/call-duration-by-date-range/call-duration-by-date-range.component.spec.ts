import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CallDurationByDateRangeComponent } from './call-duration-by-date-range.component';
import { By } from '@angular/platform-browser';

describe('CallDurationByDateRangeComponent', () => {
  let component: CallDurationByDateRangeComponent;
  let fixture: ComponentFixture<CallDurationByDateRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CallDurationByDateRangeComponent] // Import CallDurationByDateRangeComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallDurationByDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Call Duration By Date Range"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Call Duration By Date Range');
  });

  it('should display the title "Call Duration By Date Range"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Call Duration By Date Range');
  });

  it('should update endDate when onEndDateSelected is called', () => {
    const testStartDate = new Date('2024-08-07');
    const testEndDate = new Date('2024-08-08');
    component.startDate = testStartDate; // Set a valid start date
    component.onEndDateSelected(testEndDate);
    expect(component.endDate).toEqual(testEndDate);
  });

  // Test should have a tooltip with text "Click to fetch Data" on the submit button
  it('should have a tooltip with text "Click to fetch Data" on the submit button', () => {
    const buttonElement = fixture.debugElement.query(By.css('button[type="submit"]'));
    const tooltipText = buttonElement.nativeElement.getAttribute('title');
    expect(tooltipText).toBe('Click to fetch Data');
  });
});