/**
 * Author: Brandon Salvemini
 * Date: 11/8/2024
 * File: agent-performance-by-region.component.ts
 * Description: Agent performance by region component
 */

import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';

@Component({
  selector: 'app-agent-performance-by-region',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  template: `
  <h1>Agent Performance by Region</h1>
    <div class="region-container">
      <form class="form" [formGroup]="regionForm" (ngSubmit)="onSubmit()">
        <div class="form__group">
          <label class="label" for="region">Region<span class="required">*</span></label>
          <select class="select" formControlName="region" id="region" name="region">
            @for(region of regions; track region) {
              <option value="{{ region }}">{{ region }}</option>
            }
          </select>
        </div>
        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>
      @if (performanceDataByRegionData.length > 0) {
        <app-table
          [title]="'Agent Performance by Region'"
          [data]="performanceDataByRegionData"
          [headers]="['Date', 'Region', 'Agent', 'Team', 'Call Duration', 'Resolution Time', 'Feedback']"
          [recordsPerPage]="10"
          [sortableColumns]="['Date', 'Team', 'Call Duration', 'Resolution Time']"
          [headerBackground]="'default'">
        </app-table>
      }
  `,
  styles: [`
    .region-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
    }
  `]
})
export class AgentPerformanceByRegionComponent {
  regions: string[] = [];
  performanceDataByRegionData: any[] = [];

  regionForm = this.fb.group({
    region: [null, Validators.compose([Validators.required])]
  });

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/region/regions`).subscribe({ // Fetch the regions on page load
      next: (data: any) => {
        this.regions = data;
      },
      error: (err) => {
        console.error('Error fetching regions:', err);
      }
    });
  }

  onSubmit() {
    const region = this.regionForm.controls['region'].value;
    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/region/${region}`).subscribe({
      next: (data: any) => {
        this.performanceDataByRegionData = data;
        console.log(this.performanceDataByRegionData);

        for(let data of this.performanceDataByRegionData) { // Set up table
          data['Date'] = new Date (data['date']).toLocaleDateString(); // Format the date
          data['Region'] = data['region'];
          data['Team'] = data['team'];
          data['Call Duration'] = data['callDuration'];
          data['Resolution Time'] = data['resolutionTime'];
          data['Feedback'] = data['customerFeedback'];

          if (data['agentDetails'].name === undefined) { // if the agentDetails.name is undefined
            data['Agent'] = 'Unknown'; // Set agent name to unknown
          } else {
            data['Agent'] = data['agentDetails'].name; // Get agent name from agentDetails array
          }
        }
      },
      error: (err) => {
        console.error('Error fetching agent performance data: ', err);
      },
    });
  }

}
