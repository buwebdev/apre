/**
 * Author: Kylie Struhs
 * Date: 11/09/2024
 * File: agent-performance-by-customer-feedback.spec.js
 * Description: Test the agent performance by customer feedback API
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

// Test the agent performance API
describe('Apre Agent Performance by Customer Feedback API', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the agent-performance-by-customer-feedback endpoint
  it('should fetch customer feedback data for agents', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              agents: ['Agent A'],
              customerFeedback: ["helpful"]
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/agent-performance/agent-performance-by-customer-feedback/1002'); // Send a GET request to the agent-performance-by-customer-feedback endpoint

    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        agents: ['Agent A'],
        customerFeedback: ["helpful"]
      }
    ]);
  });

  it('should return 200 and an empty array if no customer feedback data is found', async () => {
    // Mock the MongoDB implementation
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      await callback(db);
    });

    // Make a request to the endpoint
    const response = await request(app).get('/api/reports/agent-performance/agent-performance-by-customer-feedback/:1002');

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // Test the agent-performance-by-customer-feedback endpoint with an invalid endpoint
  it('should return 404 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/agent-performance/agent-performance-by-customer-foodback'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(404); // Expect a 404 status code
    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});