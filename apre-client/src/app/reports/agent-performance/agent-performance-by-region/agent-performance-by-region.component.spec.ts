/**
 * Author: Brandon Salvemini
 * Date: 11/8/2024
 * File: agent-performance-by-region.component.spec.ts
 * Description: Test file for the agent performance by region component
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPerformanceByRegionComponent } from './agent-performance-by-region.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AgentPerformanceByRegionComponent', () => {
  let component: AgentPerformanceByRegionComponent;
  let fixture: ComponentFixture<AgentPerformanceByRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AgentPerformanceByRegionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPerformanceByRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title "Agent Performance by Region"', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Agent Performance by Region');
  });

  it('should not submit form is no region is selected', () => {
    spyOn(component, 'onSubmit').and.callThrough();

    const compiled = fixture.nativeElement;
    const submitBtn = compiled.querySelector('.form__actions button')
    submitBtn.click();

    expect(component.onSubmit).toHaveBeenCalled();
    expect(component.regionForm.valid).toBeFalse;
  });

  it('should initialize the regionForm with a null value', () => {
    const regionControl = component.regionForm.controls['region'];
    expect(regionControl.value).toBeNull();
    expect(regionControl.valid).toBeFalse();
  });
});
