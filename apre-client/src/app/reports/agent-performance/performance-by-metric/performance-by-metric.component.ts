import { HttpClient } from '@angular/common/http';
import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChartComponent } from '../../../shared/chart/chart.component';

@Component({
  selector: 'app-performance-by-metric',
  standalone: true,
  imports: [ReactiveFormsModule, ChartComponent],
  template: `
    <h1>Agent Performance by Metric</h1>
    <div class="metric-container">
      <form class="form" [formGroup]="perfMetricForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="perfMetric">Performance Metric<span class="required">*</span></label>
          <select class="select" formControlName="perfMetric" id="perfMetric" name="perfMetric">
            @for(pMetric of perfMetrics; track pMetric) {
              <option value="{{ pMetric }}">{{ pMetric }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--secondary" type="submit">Submit</button>
        </div>
      </form>

      @if (agents.length && performanceTotals.length) {
        <div class="card chart-card">
          <app-chart
            [type]="'bar'"
            [label]="this.reportTitle"
            [data]="this.performanceTotals"
            [labels]="this.agents">
          </app-chart>
        </div>
      }
    </div>
  `,
  styles: `
    .metric-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-container {
      width: 50%;
      margin: 0 auto;
    }

    .chart-card {
      width: 100%;
      margin: 20px 0;
    }
  `
})
export class PerformanceByMetricComponent {
  // Create variables
  //TODO: Add new performance metrics to this array as needed.
  perfMetrics: string[] = ["Customer Satisfaction", "Sales Conversion"]; // Array of performance metrics
  selectedPerfMetric: string | null = null; // Selected performance metric is set to null
  reportTitle: string = ''; // Report title, populated and set in the submit function
  agents: string[] = [];
  performanceTotals: number[] = [];
  performanceData: any[] = [];

  // Create a form group array
  perfMetricForm = this.fb.group({
    perfMetric: [null, Validators.compose([Validators.required])]
  });

  // Constructor to handle initial setup and dependency injection
  constructor(private http: HttpClient, private fb: FormBuilder) {}

  /**
   * @description
   *
   * onSubmit function to handle form action to generate a report.
   * This should not execute if there is no selected performance metric
   */
  onSubmit() {
    // Get the selected performance metric
    this.selectedPerfMetric = this.perfMetricForm.controls['perfMetric'].value;

    // Query the database for the report data
    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/performance-by-metric/${this.selectedPerfMetric}`).subscribe({
      next: (data: any) => {
        this.performanceData = data;
        // Map arrays from the data to the variables
        this.agents = this.performanceData[0].agentNames;
        this.performanceTotals = this.performanceData[0].performanceTotals;

        // Construct the report title
        this.reportTitle = "Performance by Metric - " + this.selectedPerfMetric;

        console.log('agents:', this.agents);
        console.log('performance totalsL ', this.performanceTotals);
      },
      error: (err) => {
        console.error('Error fetching sales data:', err);
      }
    });
  }
}
