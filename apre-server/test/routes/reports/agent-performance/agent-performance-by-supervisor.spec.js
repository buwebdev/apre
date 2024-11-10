/**
 * Author: Diana ruiz Garcia
 * Date: 9 November 2024
 * File: agent-performance-by-supervisor.spec.js
 * Description: Test the agent performance API for agent performance report by supervisor.
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');


jest.mock('../../../../src/utils/mongo');

// Test the agent performance API for agent performance report by supervisor.
describe('Apre Agent Performance API - Performance By Supervisor', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the agent-performance-by-supervisor endpoint
  it('should fetch performance data for agents with a specified supervisor', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              agents: ['Mia Rodriguez', 'Mason Walker', 'Ava Lewis', 'Matthew Harris', 'Ethan Clark', 'Lucas Martinez'],
              resolutionsTime: [150, 120, 100, 120, 130, 100]
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/agent-performance/agent-performance-by-supervisor/650c1f1e1c9d440000a1b1c4'); // Send a GET request to the agent-performance-by-supervisor endpoint

    expect(response.status).toBe(200); // Expect a 200 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        agents: ['Mia Rodriguez', 'Mason Walker', 'Ava Lewis', 'Matthew Harris', 'Ethan Clark', 'Lucas Martinez'],
        resolutionsTime: [150, 120, 100, 120, 130, 100]
      }
    ]);
  });

  // Test the agent-performance-by-supervisor endpoint if no supervisor is found
  it('should return 200 with an empty array if no supervisor is found', async () => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    });

    // Send a GET request to the agent-performance-by-supervisor endpoint
    const response = await request(app).get('/api/reports/agent-performance/agent-performance-by-supervisor/');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response to be an empty array
    expect(response.body).toEqual([]);
  });

  // Test the agent-performance-by-supervisor endpoint with an invalid supervisor
  it('should return 400 for an invalid endpoint', async () => {
    const response = await request(app).get('/api/reports/agent-performance/agent-performance-by-supervisor/invalid-supervisor'); // Send a GET request to an invalid endpoint
    expect(response.status).toBe(400); // Expect a 500 status code
    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Supervisor ID is required',
      status: 400,
      type: 'error'
    });
  });
});