/**
 * Author: Sheldon Skaggs
 * Date: 11/082024
 * File: performance-by-metric.spec.js
 * Description: Test the agent performance by metric report api
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

// Mock database
jest.mock('../../../../src/utils/mongo');

// Test suite for the Agent Performance by Metric Report API
describe('APRE Agent Performance by Metric Suite', () => {
  // Clear the mock before each test
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test accessing an invalid endpoint
  it('should return 404 for an invalid endpoint', async () => {
    // Send a GET request to an invalid endpoint
    const response = await request(app).get('/api/reports/agent-performance/not-an-endpoint');

    // Expect a 404 status code
    expect(response.status).toBe(404);
    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test the performance-by-metric endpoint for a metric that does not exist
  it('should return a 200 status with no metric values for each agent for a metric that does not exist', async () => {
    // Create a mock of the expected return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              "agentId": 1000,
              "agentName": "Jon Anderson",
              "metricName": "",
              "metricValue": 0,
            },
            {
              "agentId": 1002,
              "agentName": "Rindy Ross",
              "metricName": "",
              "metricValue": 0,
            },
            {
              "agentId": 1,
              "agentName": "Tom Scholz",
              "metricName": "",
              "metricValue": 0,
            }
          ])
        })
      };
      await callback(db);
    });

    // Send a GET request to the reports/agent-performance/performance-by-metric/:metricName endpoint using the value of InVaLiD
    const response = await request(app).get('/api/reports/agent-performance/performance-by-metric/InVaLiD');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        "agentId": 1000,
        "agentName": "Jon Anderson",
        "metricName": "",
        "metricValue": 0,
      },
      {
        "agentId": 1002,
        "agentName": "Rindy Ross",
        "metricName": "",
        "metricValue": 0,
      },
      {
        "agentId": 1,
        "agentName": "Tom Scholz",
        "metricName": "",
        "metricValue": 0,
      }
    ]);
  });

  // Test the performance-by-metric endpoint for a valid metric
  it('should return a 200 status with metric values for each agent for a given metric', async () => {
    // Create a mock of the expected return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              "agentId": 1000,
              "agentName": "Jon Anderson",
              "metricName": "Customer Satisfaction",
              "metricValue": 80,
            },
            {
              "agentId": 1002,
              "agentName": "Rindy Ross",
              "metricName": "Customer Satisfaction",
              "metricValue": 100,
            },
            {
              "agentId": 1,
              "agentName": "Tom Scholz",
              "metricName": "Customer Satisfaction",
              "metricValue": 90,
            }
          ])
        })
      };
      await callback(db);
    });

    // Send a GET request to the reports/agent-performance/performance-by-metric/:metricName endpoint using the value of Customer Satisfaction
    const response = await request(app).get('/api/reports/agent-performance/performance-by-metric/Customer Satisfaction');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        "agentId": 1000,
        "agentName": "Jon Anderson",
        "metricName": "Customer Satisfaction",
        "metricValue": 80,
      },
      {
        "agentId": 1002,
        "agentName": "Rindy Ross",
        "metricName": "Customer Satisfaction",
        "metricValue": 100,
      },
      {
        "agentId": 1,
        "agentName": "Tom Scholz",
        "metricName": "Customer Satisfaction",
        "metricValue": 90,
      }
    ]);
  });
});