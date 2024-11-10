import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPerformanceBySupervisorComponent } from './agent-performance-by-supervisor.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AgentPerformanceBySupervisorComponent', () => {
  let component: AgentPerformanceBySupervisorComponent;
  let fixture: ComponentFixture<AgentPerformanceBySupervisorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AgentPerformanceBySupervisorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPerformanceBySupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test the title "Agent Performance By Supervisor" is displayed.
  it('should display the title "Agent Performance By Supervisor"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Agent Performance By Supervisor');
  });

  // Test that the supervisorForm is initialized with null values.
  it('should initialize the supervisorForm with null values', () => {
    const supervisorControl = component.supervisorForm.controls['supervisor'];

    expect(supervisorControl.value).toBeNull();
    expect(supervisorControl.valid).toBeFalse();
  });

  // Test that the form should not be submit if no supervisor has been selected.
  it('should not submit the form if no supervisor is selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('.form__actions button');
    submitButton.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.supervisorForm.valid).toBeFalse();
  });
});
