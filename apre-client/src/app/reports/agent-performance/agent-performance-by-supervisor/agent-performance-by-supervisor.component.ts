import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-agent-performance-by-supervisor',
  standalone: true,
  imports: [ReactiveFormsModule, ChartComponent],
  template: `
    <h1>Agent Performance By Supervisor</h1>
    <div class="supervisor-container">
      <form class="form" [formGroup]="supervisorForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="supervisor">Supervisor ID<span class="required">*</span></label>
          <select class="select" formControlName="supervisor" id="supervisor" name="supervisor">
            @for(supervisor of supervisors; track supervisor) {
              <option value="{{ supervisor }}">{{ supervisor }}</option>
            }
          </select>
        </div>

        <div class="form__actions">
          <button class="button button--primary" type="submit" title="Click to fetch Data">Submit</button>
        </div>
      </form>

      <br />
      @if (showChart) {
        <div class="card chart-card">
          <app-chart
            [type]="'bar'"
            [label]="'Agent Performance'"
            [data]="resolutionTime"
            [labels]="agents">
          </app-chart>
        </div>
      }
    </div>
  `,
  styles: `
    .supervisor-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
    }
  `
})
export class AgentPerformanceBySupervisorComponent implements AfterViewInit {
  supervisors: string[] = []; // Initially empty
  resolutionTime: number[] = []; // Initially empty
  agents: string[] = []; // Initially empty
  showChart: boolean = false; // Initially hidden

  supervisorForm = this.fb.group({
    supervisor: [null, Validators.compose([Validators.required])]
  });

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Query to get the supervisors
    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/agent-performance-by-supervisor`).subscribe({
      next: (data: any) => {
        this.supervisors = data;
      },
      error: (err) => {
        console.error('Error fetching supervisors:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    // No need to create chart here, it will be handled by ChartComponent
  }

  onSubmit() {
    // Get the value ​​of the field in the form
    const supervisor = this.supervisorForm.controls['supervisor'].value;

    // Check if there is any value in the supervisor field
    if(supervisor) {
      // Query that finds sales associated with the obtained supervisor
      this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/agent-performance-by-supervisor/${supervisor}`).subscribe({
        next: (data: any) => {
          // Set the values obtained
          this.resolutionTime = data[0].resolutionsTime;
          this.agents = data[0].agents;
        },
        error: (error: any) => {
          console.error('Error fetching agent performance by supervisor data:', error);
        },
        complete: () => {
          this.showChart = true; // Show chart after fetching data
        }
      });
    } else {
      // If there is no value in the supervisor field, an alert is generated to prompt the user to select one.
      alert('Please select a supervisor.');
    }
  }

}
