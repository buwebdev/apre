import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AgentPerformanceByCustomerFeedbackComponent } from './agent-performance-by-customer-feedback.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/table/table.component';

// Test Suite testing the Angular Component AgentPerformanceByCustomerFeedback

describe('AgentPerformanceByFeedbackComponent', () => {
  let component: AgentPerformanceByCustomerFeedbackComponent;
  let fixture: ComponentFixture<AgentPerformanceByCustomerFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AgentPerformanceByCustomerFeedbackComponent, ReactiveFormsModule, TableComponent] // Import AgentPerformanceByCustomerFeedbackComponent
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPerformanceByCustomerFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Three Unit Tests

  // Test to display title "Agent Performance by Customer Feedback"
  it('should display the title "Agent Performance by Customer Feedback"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Agent Performance by Customer Feedback');
  });

  it('should initialize the agentFeedbackForm with a null value', () => {
    const agentControl = component.agentFeedbackForm.controls['agentId'];
    expect(agentControl.value).toBeNull();
    expect(agentControl.valid).toBeFalse();
  });

  it('should not submit the form if no agent is selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.agentFeedbackForm.valid).toBeFalse();
  });
});
